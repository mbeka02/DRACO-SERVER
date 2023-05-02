import { StatusCodes } from "http-status-codes";
import Session from "../models/Session.js";
import BadRequestError from "../errors/bad-request.js";

//handles all payment and transaction business logic

const getPendingPayments = async (req, res) => {
  const payments = await Session.find({
    student: req.user.userId,
    isPayedFor: false,
  });

  res.status(StatusCodes.OK).json({ payments });
};

const getPendingPayment = async (req, res) => {
  const { id: paymentId } = req.params;
  const payment = await Session.findOne(
    {
      _id: paymentId,
      student: req.user.userId,
    }, //get info of tutor
    { userIds: { $elemMatch: { $ne: req.user.userId } } }
  )
    .populate("userIds", "name")
    .select("subject recurrence duration amount");

  if (!payment) {
    throw new BadRequestError("Unable to find details on this session");
  }

  res.status(StatusCodes.OK).json({ payment });
};

export { getPendingPayments, getPendingPayment };
