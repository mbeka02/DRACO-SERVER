import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "provide a name for the course"],
  },
  code: {
    type: String,
  },
});

export default mongoose.model("Course", CourseSchema);
