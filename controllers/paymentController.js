import { StatusCodes } from "http-status-codes";
import Session from "../models/Session.js";
import BadRequestError from "../errors/bad-request.js";
import Transaction from "../models/Transaction.js";
import axios from "axios";
import { makePayout } from "../utilities/daraja.js";
import { User } from "../models/User.js";
axios.defaults.withCredentials = true;

//handles all payment and transaction business logic

const getPendingPayments = async (req, res) => {
  const payments = await Session.find(
    {
      student: req.user.userId,
      isPayedFor: false,
    },
    { userIds: { $elemMatch: { $ne: req.user.userId } } }
  )
    .populate("userIds", "name")
    .select("subject duration amount");

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

  if (!phoneNumber || !amount) {
    throw new BadRequestError("Please provide a phone number and amount");
  }
  if (amount < 1) {
    throw new BadRequestError("Amount must be greater than 0");
  }
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
        "https://0fae-41-90-70-255.ngrok-free.app/api/v1/payments/callback", // ngrok- https://64b6-41-90-65-7.ngrok-free.app
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
  //update payment status
  //just for testing
  const session = await Session.findOne({ student: req.user.userId });
  session.isPayedFor = true;
  await session.save();
  //makePayout(amount, "254708374149");
  res.status(StatusCodes.OK).json({ data: response.data });
};
//call back for mobile payment
const mobilePaymentCallback = async (req, res) => {
  console.log(req.body);
};

//paystack payment
const paystackPayment = async (req, res) => {
  //initialize payment , include plan if it is a subscription
  const { email, amount } = req.body;
  const session = await Session.findOne({ student: req.user.userId });
  const plan = session.plan;
  //optionally include plan

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount,
      /*callback_url:
        "https://0fae-41-90-70-255.ngrok-free.app/api/v1/payments/callback",*/
      plan,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  res.status(StatusCodes.OK).json({ data: response.data });
};

//create plan
/*const createPlan = async (req, res) => {
  const { duration, email, reccurence, subject } = req.body;
  //find the user based on the email provided
  const student = await User.findOne({ email: email });
  if (!student) {
    throw new BadRequestError("Unable to find students email");
  }
  const tutor = await User.findOne({ _id: req.user.userId });
  const amount = duration * tutor.Rate;
  const response = await axios.post(
    "https://api.paystack.co/plan",
    {
      name: `${student._id}-${subject}`,
      amount,
      interval: reccurence,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  res.status(StatusCodes.OK).json({ data: response.data });
};*/

export {
  getPendingPayments,
  getPendingPayment,
  mobilePayment,
  mobilePaymentCallback,
  paystackPayment,
};
