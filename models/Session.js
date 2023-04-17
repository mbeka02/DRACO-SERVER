import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.ObjectId,
    ref: "Tutor",
    required: true,
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
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
});

export default mongoose.model("Session", SessionSchema);
