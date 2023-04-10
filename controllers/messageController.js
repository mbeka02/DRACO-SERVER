import { StatusCodes } from "http-status-codes";
import Message from "../models/Message.js";
import Room from "../models/Room.js";
import BadRequestError from "../errors/bad-request.js";

const createMessage = async (req, res) => {
  const { id: roomId } = req.params;
  const { text } = req.body;
  const room = await Room.findOne({ _id: roomId });

  if (!room) {
    throw new BadRequestError("Unable to find chat room details");
  }

  const newMessage = await Message.create({
    sender: req.user.userId,
    createdBy: req.user.name,
    text: text,
    room: roomId,
  });
  room.messages.push(newMessage);
  await room.save();
  res.status(StatusCodes.CREATED).json({ msg: "message created" });
};

const getRoomMessages = async (req, res) => {
  const { id: roomId } = req.params;
  const roomMessages = await Room.findOne(
    { _id: roomId },
    {
      /*gets name of the other person the user is in the room with-might be 
  problematic since a user can change their name and this field won't update*/
      userNames: { $elemMatch: { $ne: req.user.name } },
    }
  ).populate("messages");
  res.status(StatusCodes.OK).json({ roomMessages });
};

export { createMessage, getRoomMessages };
