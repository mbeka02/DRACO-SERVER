import { Router } from "express";
import { createChatRoom, getChatRooms } from "../controllers/roomController.js";

const router = Router();

router.route("/").get(getChatRooms);
router.route("/:id").post(createChatRoom);

export default router;
