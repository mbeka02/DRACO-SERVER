import {
  getAllTutors,
  getSingleTutor,
  createTutorReview,
  updateTutorProfile,
  uploadDocuments,
  addEducationalDetails,
  addCourses,
  getCourses,
} from "../controllers/tutorController.js";

import { fileUpload } from "../middleware/upload.js";

import { Router } from "express";

const router = Router();

router.route("/").get(getAllTutors);
router.route("/education").post(addEducationalDetails);
router.route("/addCourses").post(addCourses);
router.route("/getCourses").get(getCourses);
router
  .route("/uploadDocuments")
  .post(fileUpload.array("files"), uploadDocuments);
router.route("/updateProfile").patch(updateTutorProfile);
router.route("/:id").get(getSingleTutor).post(createTutorReview);

export default router;
