import { Router } from "express";
import { createRoom, getRooms } from "../controllers/roomController.js";

const router = Router();

router.route("/").get(getRooms);
router.route("/:id").post(createRoom);

export default router;
