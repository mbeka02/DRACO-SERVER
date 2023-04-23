import {
  createSession,
  getSessions,
  getSession,
} from "../controllers/sessionController.js";

import { Router } from "express";
import { checkPrivileges } from "../middleware/authentication.js";

const router = Router();

router
  .route("/")
  .get(getSessions)
  //I only want tutor accounts to access this route/fn
  .post(checkPrivileges("Tutor"), createSession);

router.route("/:id").get(getSession);

export default router;
