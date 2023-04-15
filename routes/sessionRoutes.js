import { createSession } from "../controllers/sessionController.js";

import { Router } from "express";

const router = Router();

router.route("/").post(createSession);

export default router;
