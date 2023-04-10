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

  const room = await Room.create({
    userIds: [req.user.userId, tutorId],
    userNames: [req.user.name, tutor.name],
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
      /*gets name of the other person the user is in the room with-might be 
      problematic since a user can change their name and this field won't update*/
      userNames: { $elemMatch: { $ne: req.user.name } },
    }
  ).populate("messages");
  res.status(StatusCodes.OK).json({ rooms });
};

export { createRoom, getRooms };
