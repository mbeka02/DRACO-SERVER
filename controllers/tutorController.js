import { Education, Tutor } from "../models/User.js";
import Review from "../models/Review.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";

const getAllTutors = async (req, res) => {
  const { search, order } = req.query;
  /*const tutors = await Tutor.aggregate([
     {
      $unwind: "$Courses",
    },
    //can't get this to work yet
    {
      $search: {
        index: "name_auto",
        autocomplete: {
          query: search, // noticed we assign a dynamic value to "query"
          path: "Courses",
        },
      },
    },
    {
      $project: {
        name: 1,
      },
    },
  ]);*/

  //.select("-password").populate("Courses");
  // console.log(order);
  //refactor
  if (search) {
    const tutors = await Tutor.find({
      Courses: { $in: [search] },
      isProfileComplete: true,
    }).select("-password -Messages -documents ");

    return res.status(StatusCodes.OK).json({ tutors });
  }
  if (order) {
    const tutors = await Tutor.find({ isProfileComplete: true })
      .select("-password -Messages -documents")
      .sort({ Rate: order });
    return res.status(StatusCodes.OK).json({ tutors });
  }
  if (search && order) {
    const tutors = await Tutor.find({
      Courses: { $in: [search] },
      isProfileComplete: true,
    })
      .select("-password -Messages -documents ")
      .sort({ Rate: order });

    return res.status(StatusCodes.OK).json({ tutors });
  }
  const tutors = await Tutor.find({ isProfileComplete: true }).select(
    "-password -Messages -documents"
  );
  res.status(StatusCodes.OK).json({ tutors });
};

const getSingleTutor = async (req, res) => {
  const { id: tutorId } = req.params;
  const tutor = await Tutor.findOne({ _id: tutorId })
    .select("-password -Messages -documents")
    .populate("reviews EducationInfo");

  if (!tutor) {
    throw new BadRequestError(
      "Unable to find tutor account , it might've been deleted"
    );
  }

  res.status(StatusCodes.OK).json({ tutor });
};

const updateTutorProfile = async (req, res) => {
  const { Headline, Description, Rate, Experience } = req.body;
  const tutor = await Tutor.findOne({ _id: req.user.userId });
  if (!tutor) {
    throw new BadRequestError(
      "Unable to find and update your account details, please try again"
    );
  }

  const isProfileComplete =
    Headline && Description && Rate && Experience ? true : false;

  tutor.Headline = Headline;
  tutor.Description = Description;
  tutor.Rate = Rate;
  tutor.Experience = Experience;
  tutor.isProfileComplete = isProfileComplete;

  await tutor.save();
  res.status(StatusCodes.OK).json({ msg: "Details updated" });
};

const addCourses = async (req, res) => {
  const { name } = req.body;
  const tutor = await Tutor.findOne({ _id: req.user.userId });
  if (!tutor) {
    throw new BadRequestError(
      "An error has occured, your tutor account details could not be found"
    );
  }
  //const course = await Course.create(req.body);
  if (!name) {
    throw new BadRequestError(
      "Ensure that you have filled all the required fields"
    );
  }
  //tutor.Courses.push(course);
  tutor.Courses.push(name);
  await tutor.save();
  res.status(StatusCodes.OK).json({ msg: "Details added" });
};

const addEducationalDetails = async (req, res) => {
  const { school, degree, from, to } = req.body;
  const tutor = await Tutor.findOne({ _id: req.user.userId });
  if (!tutor) {
    throw new BadRequestError(
      "An error has occured, your tutor account details could not be found"
    );
  }
  if (!school || !from || !to) {
    throw new BadRequestError(
      "Ensure that you have filled all the required fields"
    );
  }
  const details = await Education.create({ school, degree, from, to });
  tutor.EducationInfo.push(details);
  await tutor.save();
  res.status(StatusCodes.OK).json({ msg: "Details added" });
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
  const tutor = await Tutor.findOne({ _id: req.user.userId });
  for (let i = 0; i < documents.length; ++i) {
    tutor.documents.push(`/documents/${req.files[i].originalname}`);
  }
  await tutor.save();

  res.status(StatusCodes.OK).json({ msg: "files uploaded successfully" });
};

export {
  getAllTutors,
  getSingleTutor,
  createTutorReview,
  updateTutorProfile,
  uploadDocuments,
  addEducationalDetails,
  addCourses,
};
