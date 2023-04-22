import { Router } from "express";
import { createChatRoom, getChatRooms } from "../controllers/roomController.js";
import { checkPrivileges } from "../middleware/authentication.js";

const router = Router();

router.route("/").get(getChatRooms);
router.route("/:id").post(checkPrivileges("Student"), createChatRoom);

export default router;
