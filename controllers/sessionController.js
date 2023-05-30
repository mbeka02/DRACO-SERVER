import { StatusCodes } from "http-status-codes";
import Session from "../models/Session.js";
import { User } from "../models/User.js";
import BadRequestError from "../errors/bad-request.js";
import axios from "axios";

const createSession = async (req, res) => {
  const { duration, email, subject, startedAt, recurrence } = req.body;
  //find the user based on the email provided
  const student = await User.findOne({ email: email });
  //get tutor id
  const tutor = await User.findOne({ _id: req.user.userId });
  if (!student) {
    throw new BadRequestError("Unable to find students email");
  }
  //create a session
  const session = await Session.create({
    duration,
    subject,
    email,
    userIds: [req.user.userId, student._id],
    student: student._id,
    amount: tutor.Rate,
    startedAt,
    recurrence,
  });

  const response = await axios.post(
    "https://api.paystack.co/plan",
    {
      name: `${student._id}-${subject}`,
      amount: tutor.Rate * duration,
      // interval: recurrence,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  session.plan = response.data.data.id;
  await session.save();

  res.status(StatusCodes.CREATED).json({
    msg: "meeting created , check the sessions tab after payment",
    data: response.data,
  });
};

const getSessions = async (req, res) => {
  const { search } = req.query;
  //get all the sessions that the user is in that have been paid for
  const sessions = await Session.find(
    search
      ? {
          userIds: {
            $in: [req.user.userId],
          },
          isPayedFor: true,
          subject: search,
        }
      : {
          userIds: {
            $in: [req.user.userId],
          },
          isPayedFor: true,
        }
  )
    .populate("userIds", "name avatarUrl role")
    .select("status subject startedAt");
  res.status(StatusCodes.OK).json({ sessions });
};

const getSession = async (req, res) => {
  const { id: sessionId } = req.params;
  const session = await Session.findOne(
    { _id: sessionId },
    //get info of other person
    { userIds: { $elemMatch: { $ne: req.user.userId } } }
  ).populate("userIds", "name avatarUrl");

  res.status(StatusCodes.OK).json({ session });
};

export { createSession, getSessions, getSession };
