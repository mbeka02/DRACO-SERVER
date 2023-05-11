import { StatusCodes } from "http-status-codes";
import Session from "../models/Session.js";
import BadRequestError from "../errors/bad-request.js";
import Transaction from "../models/Transaction.js";
import axios from "axios";
axios.defaults.withCredentials = true;

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

//handles mobile transactions
const mobilePayment = async (req, res) => {
  const { phoneNumber, amount } = req.body;
  //remove 0 from phone number
  const phone = phoneNumber.substring(1);

  //generate timestamp
  const date = new Date();
  const timestamp =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0") +
    date.getHours().toString().padStart(2, "0") +
    date.getMinutes().toString().padStart(2, "0") +
    date.getSeconds().toString().padStart(2, "0");

  console.log(timestamp);

  const password = Buffer.from(
    "174379" +
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
      timestamp
  ).toString("base64");
  const response = await axios.post(
    //request body
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: "174379",
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", //CustomerBuyGoodsOnline
      Amount: amount,
      PartyA: `254${phone}`,
      PartyB: "174379",
      PhoneNumber: `254${phone}`,
      //change to live URL in prod won't work in dev
      CallBackURL:
        "https://0d2a-41-90-65-7.ngrok-free.app/api/v1/payments/callback", // ngrok- https://64b6-41-90-65-7.ngrok-free.app
      AccountReference: "Test",
      TransactionDesc: "Test",
    },
    {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    }
  );
  // console.log(response);
  res.status(StatusCodes.OK).json({ data: response.data });
};
//call back for mobile payment
const mobilePaymentCallback = async (req, res) => {
  console.log(req.body);
};
export {
  getPendingPayments,
  getPendingPayment,
  mobilePayment,
  mobilePaymentCallback,
};
