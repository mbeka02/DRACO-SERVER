import { Router } from "express";
import {
  register,
  login,
  verifyAccount,
  logout,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authentication.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").delete(authenticateUser, logout);
router.route("/verifyAccount/:id").get(verifyAccount);

export default router;
