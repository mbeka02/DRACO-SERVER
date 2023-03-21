import mongoose, { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    post: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment cannot be empty"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Comment", CommentSchema);
