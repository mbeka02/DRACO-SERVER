import { StatusCodes } from "http-status-codes";
import Session from "../models/Session.js";
import BadRequestError from "../errors/bad-request.js";

//handles all payment and transaction business logic

const getPendingPayments = async (req, res) => {
  const pendingPayments = await Session.find({
    student: req.user.userId,
    isPayedFor: false,
  });

  res.status(StatusCodes.OK).json({ payments: pendingPayments });
};

const getPendingPayment = async (req, res) => {
  const { id: paymentId } = req.params;
  const pendingPayment = await Session.findOne(
    {
      _id: paymentId,
      student: req.user.userId,
    }, //get info of tutor
    { userIds: { $elemMatch: { $ne: req.user.userId } } }
  )
    .populate("userIds", "name")
    .select("subject recurrence duration amount");

  if (!pendingPayment) {
    throw new BadRequestError("Unable to find details on this session");
  }

  res.status(StatusCodes.OK).json({ payment: pendingPayment });
};

export { getPendingPayments, getPendingPayment };
