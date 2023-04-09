import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    userIds: {
      type: Array,
      required: true,
    },
    userNames: {
      type: Array,
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
