import mongoose, { Schema, model } from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";

//BASE USER SECTION
const BaseSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "name field cannot be empty"],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "email field cannot be empty"],
    validate: {
      validator: validator.isEmail,
      message: "email is invalid",
    },
  },
  phoneNumber: {
    type: String,
  },

  password: {
    type: String,
    trim: true,
    required: [true, "password field cannot be empty"],
    minlength: 8,
  },

  role: {
    type: String,
    enum: ["Student", "Tutor"],
    required: [true, "Select a role"],
    //default: "Student",
  },
  /*verificationToken: {
    type: String,
  },*/
  avatarUrl: {
    type: String,
  },

  verificationStatus: {
    type: Boolean,
    default: false,
  },
  verificationDate: {
    type: Date,
  },
  //City/Town of residence
  City: {
    type: String,
  },
});

//HASHING FUNCTION FOR PASSWORD
BaseSchema.pre("save", async function (next) {
  //don't rehash password when user info is modified
  if (!this.isModified("password")) return next();
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});
//verifies password
BaseSchema.methods.verifyPassword = async function (inputPassword) {
  const isValid = await bcryptjs.compare(inputPassword, this.password);
  return isValid;
};

//export default model("User", BaseSchema);

const User = model("User", BaseSchema);

//TUTOR SECTION

//Using discriminators- a schema inheritance mechanism -https://mongoosejs.com/docs/discriminators.html
const options = { discriminatorKey: "Kind", collection: "users" };

//Schema for educational background info for the tutors
const EducationSchema = new Schema({
  //name of the school
  school: {
    type: String,
  },
  //degree attained
  degree: {
    type: String,
  },

  from: {
    type: Number,
  },
  to: {
    type: Number,
  },
});
const Education = model("Education", EducationSchema);

//tutors schema
const TutorSchema = User.discriminator(
  "Tutor",
  new Schema({
    rating: {
      type: Number,
    },
    //reviews left for tutors
    reviews: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Review",
      },
    ],
    //current institute they work at
    institute: {
      type: String,
    },
    //A short phrase of a tutors expertise
    Headline: {
      type: String,
    },
    //Defines expertise in detail
    Description: {
      type: String,
    },
    //Hourly rate charged by tutors
    Rate: {
      type: Number,
    },
    //Years of tutoring experience
    Experience: {
      type: Number,
    },
    //refrence to uploaded documents
    documents: [
      {
        type: String,
      },
    ],
    //sub-document for education info
    EducationInfo: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Education",
      },
    ],
    //Might change back to sub-document
    Courses: {
      type: Array,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  }),
  options
);
const Tutor = model("Tutor");

export { User, Tutor, Education };
