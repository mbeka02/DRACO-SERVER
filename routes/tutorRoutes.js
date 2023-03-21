import {
  getAllTutors,
  getSingleTutor,
  createTutorReview,
  updateTutorProfile,
} from "../controllers/tutorController.js";

import { Router } from "express";

const router = Router();

router.route("/").get(getAllTutors);
router.route("/updateProfile").patch(updateTutorProfile);
router.route("/:id").get(getSingleTutor).post(createTutorReview);

export default router;
