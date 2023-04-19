import { StatusCodes } from "http-status-codes";
import { VideoCall } from "../models/Room.js";
import { User } from "../models/User.js";

const createSession = async (req, res) => {
  const { status, duration, email } = req.body;
  const student = await User.find({ email: email });
  await VideoCall.create({
    status,
    duration,
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
