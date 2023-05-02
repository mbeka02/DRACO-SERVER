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
const sessionSchema = new mongoose.Schema(
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
    student: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: [true, "Enter the your rates per hour"],
    },
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
    isPayedFor: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      required: [true, "Enter the date and time of the session"],
    },
    recurrence: {
      type: String,
    },
  },
  { timestamps: true }
);
const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
const Session = mongoose.model("Session", sessionSchema);
export { ChatRoom, Session };
