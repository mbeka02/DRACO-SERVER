import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    users: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
