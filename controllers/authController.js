import { User, Tutor } from "../models/User.js";
import Token from "../models/Token.js";
import createTokenUser from "../utilities/createTokenUser.js";
import { attachCookies } from "../utilities/jwt.js";
import { StatusCodes } from "http-status-codes";

import { sendActivationEmail } from "../utilities/emailHandler.js";
import BadRequestError from "../errors/bad-request.js";
import UnauthorizedError from "../errors/unauthorized.js";

import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
//import { createJWT, verifyToken } from "../utilities/jwt.js";
import UnauthenticatedError from "../errors/unauthenticated.js";

import dotenv from "dotenv";
dotenv.config();

const register = async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body;

  const emailExists = await User.findOne({ email: email });

  if (emailExists) {
    throw new BadRequestError("Email is already in use");
  }

  const accountType = role === "Tutor" ? Tutor : User;

  const user = await accountType.create({
    name,
    email,
    password,
    role,
    phoneNumber,
    avatarUrl: "/images/default.png",
  });
  // create 'activation' token and pass it to email sending fn, use the email as the payload
  const activationToken = jwt.sign(
    email,
    process.env.EMAIL_SECRET
  ); /*createJWT({
      payload: { email },
    });*/
  const origin = "http://localhost:3000";
  await sendActivationEmail({
    name: user.name,
    email: user.email,
    activationToken: activationToken,
    origin: origin,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Account created , check your email to verify your account" });
};

const verifyAccount = async (req, res) => {
  //Check and verify activation token that was added to the url
  const { id: activationId } = req.params;
  const payload = jwt.verify(
    activationId,
    process.env.EMAIL_SECRET
  ); /*verifyAccount(
      activationId
    );*/

  const user = await User.findOne({ email: payload });

  if (!user) {
    throw new BadRequestError("verification has failed");
  }
  //change verification status and save
  user.verificationDate = Date.now();
  user.verificationStatus = true;
  await user.save();

  res.redirect("http://localhost:5173/confirmation");
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError(
      "Ensure that you have entered your email and password"
    );
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new BadRequestError(
      "Account does not exist or the email is incorrect"
    );
  }
  //check if password is valid
  const isValid = await user.verifyPassword(password);

  if (!isValid) {
    throw new UnauthorizedError("The input password is incorrect");
  }
  // check verification status
  if (!user.verificationStatus) {
    throw new UnauthenticatedError(
      "Ensure that you have verified your account"
    );
  }
  const tokenUser = createTokenUser(user);

  let refreshToken = "";
  const ExistingToken = await Token.findOne({ user: user._id });

  if (ExistingToken) {
    //check if token is still valid
    const { isValid } = ExistingToken;
    if (!isValid) {
      throw new BadRequestError("Something went wrong, try again");
    }
    refreshToken = ExistingToken.refreshToken;
    attachCookies({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = nanoid(64);
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  const newToken = {
    refreshToken: refreshToken,
    ip: ip,
    userAgent: userAgent,
    user: user._id,
  };

  await Token.create(newToken);

  attachCookies({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ tokenUser });
};

//Revoke all tokens
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

export { register, login, verifyAccount, logout };
