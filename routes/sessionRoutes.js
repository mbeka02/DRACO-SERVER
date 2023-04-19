import {
  createSession,
  getSessions,
} from "../controllers/sessionController.js";

import { Router } from "express";

const router = Router();

router.route("/").get(getSessions).post(createSession);

export default router;
