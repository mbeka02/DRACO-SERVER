import { StatusCodes } from "http-status-codes";
import { VideoCall } from "../models/Room.js";
import { User } from "../models/User.js";
import BadRequestError from "../errors/bad-request.js";

const createSession = async (req, res) => {
  const { duration, email, subject } = req.body;
  //find the user based on the email provided
  const student = await User.findOne({ email: email });
  if (!student) {
    throw new BadRequestError("Unable to find students email");
  }
  await VideoCall.create({
    duration,
    subject,
    email,
    userIds: [req.user.userId, student._id],
  });
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "meeting created , check the sessions tab " });
};

const getSessions = async (req, res) => {
  //get all the sessions that the user is in
  const sessions = await VideoCall.find({
    userIds: {
      $in: [req.user.userId],
    },
  });
  res.status(StatusCodes.OK).json({ sessions });
};

export { createSession, getSessions };
