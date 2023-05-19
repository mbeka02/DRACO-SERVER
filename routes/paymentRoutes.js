import { Router } from "express";
import {
  getPendingPayment,
  getPendingPayments,
  mobilePayment,
  mobilePaymentCallback,
  paystackPayment,
} from "../controllers/paymentController.js";
import { generateAccessToken } from "../middleware/authentication.js";

const router = Router();

router.route("/").get(getPendingPayments);
router.route("/stk").post(generateAccessToken, mobilePayment);
router.route("/paystack").post(paystackPayment);
router.route("/callback").post(mobilePaymentCallback);

router.route("/:id").get(getPendingPayment);

export default router;
