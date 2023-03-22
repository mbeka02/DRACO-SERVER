import { Tutor } from "../models/User.js";
import Review from "../models/Review.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";

const getAllTutors = async (req, res) => {
  const tutors = await Tutor.find({}).select("-password");

  res.status(StatusCodes.OK).json({ tutors });
};

const getSingleTutor = async (req, res) => {
  const { id: tutorId } = req.params;
  const tutor = await Tutor.findOne({ _id: tutorId })
    .select("-password")
    .populate("reviews");

  if (!tutor) {
    throw new BadRequestError(
      "Unable to find tutor account , it might've been deleted"
    );
  }

  res.status(StatusCodes.OK).json({ tutor });
};

const updateTutorProfile = async (req, res) => {
  const tutor = await Tutor.findByIdAndUpdate(
    { _id: req.user.userId },
    req.body,
    {
      runValidators: true,
    }
  );
  if (!tutor) {
    throw new BadRequestError(
      "Unable to find and update your account details, please try again"
    );
  }
  res.status(StatusCodes.OK).json({ msg: "Details updated" });
};

const createTutorReview = async (req, res) => {
  const { review } = req.body;
  const { id: tutorId } = req.params;

  const tutor = await Tutor.findOne({ _id: tutorId });

  if (!tutor) {
    throw new BadRequestError(
      "Unable to find tutor account , it might've been deleted"
    );
  }

  const newReview = await Review.create({
    review,
    user: req.user.userId,
    createdBy: req.user.name,
  });

  tutor.reviews.push(newReview);

  await tutor.save();
  res.status(StatusCodes.CREATED).json({ msg: "Review created" });
};

const uploadDocuments = async (req, res) => {
  const documents = req.files;
  if (!documents || documents.length === 0) {
    throw new BadRequestError("Nothing to upload.");
  }

  res.status(StatusCodes.OK).json({ msg: "Documents uploaded" });
};

export {
  getAllTutors,
  getSingleTutor,
  createTutorReview,
  updateTutorProfile,
  uploadDocuments,
};
