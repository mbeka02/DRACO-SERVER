import { Router } from "express";
import {
  createMessage,
  getRoomMessages,
} from "../controllers/messageController.js";

const router = Router();

router.route("/create/:id").post(createMessage);
router.route("/:id/messages").get(getRoomMessages);

export default router;
