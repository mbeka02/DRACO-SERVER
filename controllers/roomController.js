import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import Room from "../models/Room.js";
import { Tutor } from "../models/User.js";

const createRoom = async (req, res) => {
  const { id: tutorId } = req.params;
  const roomExists = await Room.findOne({
    //finds the exact room
    userIds: { $eq: [req.user.userId, tutorId] },
  });

  if (roomExists) {
    // console.log(roomExists);
    return res.status(StatusCodes.OK).json({ room: roomExists });
  }
  const tutor = await Tutor.findOne({ _id: tutorId });
  if (!tutor) {
    throw new BadRequestError(
      "An error has occured unable to find their account"
    );
  }

  const room = await Room.create({
    userIds: [req.user.userId, tutorId],
  });
  res.status(StatusCodes.CREATED).json({ room });
};
//switch to aggregate
const getRooms = async (req, res) => {
  const rooms = await Room.find(
    /*Gets all the chats the user is in*/
    { userIds: { $in: [req.user.userId] } },
    /*gets array with only last index(message)
    -preview feature for the latest message in the room check index.jsx in the messages folder on the client*/
    {
      messages: { $slice: -1 },
      //gets info on the other person the user is with
      /*refactor*/
      userIds: { $elemMatch: { $ne: req.user.userId } },
    }
  )
    .populate("messages")
    .populate("userIds", "name avatarUrl");
  res.status(StatusCodes.OK).json({ rooms });
};

export { createRoom, getRooms };
