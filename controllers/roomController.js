import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import Room from "../models/Room.js";
import { Tutor } from "../models/User.js";

const createRoom = async (req, res) => {
  const { id: tutorId } = req.params;
  const tutor = await Tutor.findOne({ _id: tutorId });
  if (!tutor) {
    throw new BadRequestError(
      "An error has occured unable to find their account"
    );
  }

  const room = await Room.create({ users: [req.user.userId, tutorId] });
  res.status(StatusCodes.CREATED).json({ room });
};

const getRooms = async (req, res) => {
  const rooms = await Room.find(
    { users: { $in: [req.user.userId] } },
    //gets array with only last index(message)
    { messages: { $slice: -1 } }
  ).populate("messages");
  res.status(StatusCodes.OK).json({ rooms });
};

export { createRoom, getRooms };
