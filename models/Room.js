import mongoose from "mongoose";

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

export default mongoose.model("ChatRoom", ChatRoomSchema);
