import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
