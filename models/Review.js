import mongoose, { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "Please provide a review before submitting"],
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
  },
  { timestamps: true }
);

export default model("Review", ReviewSchema);
