import mongoose from "mongoose";
import validator from "validator";

const ChatRoomSchema = new mongoose.Schema(
  {
    userIds: [
      {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
      },
      {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);
const videoCallSchema = new mongoose.Schema(
  {
    userIds: [
      {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
      },
      {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In progress", "Complete"],
      default: "Pending",
    },
    duration: {
      type: Number,
      required: [true, "Enter the duration of the session"],
    },
    email: {
      type: String,
      required: [true, "Enter the email of the student"],
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "email is invalid",
      },
    },
    subject: {
      type: String,
      required: [true, "Enter the subject to be discussed"],
    },
  },
  { timestamps: true }
);
const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
const VideoCall = mongoose.model("VideoCall", videoCallSchema);
export { ChatRoom, VideoCall };
