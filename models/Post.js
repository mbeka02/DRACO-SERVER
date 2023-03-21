import mongoose, { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "provide a title"],
    },
    topic: {
      type: String,
      trim: true,
      required: [true, "provide a  topic for the question asked"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "give a brief description of the problem"],
    },
    comment: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Post", PostSchema);
