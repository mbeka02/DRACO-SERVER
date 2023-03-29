import { StatusCodes } from "http-status-codes";
import Message from "../models/Message.js";

const createMessage = async (req, res) => {
  const { id: roomId } = req.params;
  const { text } = req.body;

  await Message.create({ sender: req.user.userId, text: text, room: roomId });
  res.status(StatusCodes.CREATED).json({ msg: "message created" });
};

const getRoomMessages = async (req, res) => {
  const { id: roomId } = req.params;
  const messages = await Message.find({ room: roomId });
  res.status(StatusCodes.OK).json({ messages });
};

export { createMessage, getRoomMessages };
