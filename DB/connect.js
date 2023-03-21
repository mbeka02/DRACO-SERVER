import mongoose from "mongoose";

const connectDB = (connectionString) => {
  return mongoose.set("strictQuery", false).connect(connectionString, {
    useUnifiedTopology: true,
  });
};

export default connectDB;
