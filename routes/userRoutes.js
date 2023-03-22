import { Router } from "express";
import {
  showCurrentUser,
  uploadImage,
  getAvatar,
  getProfile,
  updatePassword,
  updateProfile,
} from "../controllers/userController.js";

import { imageUpload } from "../middleware/upload.js";

const router = Router();
router.route("/showUser").get(showCurrentUser);
router.route("/avatar").get(getAvatar);
router.route("/profile").get(getProfile);
router.route("/updateProfile").patch(updateProfile);
router.route("/updatePassword").post(updatePassword);
router
  .route("/updateProfilePicture")
  .post(imageUpload.single("upload"), uploadImage);

export default router;
