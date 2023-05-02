import { Router } from "express";
import {
  getPendingPayment,
  getPendingPayments,
} from "../controllers/paymentController.js";

const router = Router();

router.route("/").get(getPendingPayments);
router.route("/:id").get(getPendingPayment);

export default router;
