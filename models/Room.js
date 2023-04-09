import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    users: {
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
