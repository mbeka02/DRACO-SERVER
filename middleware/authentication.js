import UnauthenticatedError from "../errors/unauthenticated.js";
import { attachCookies, verifyToken } from "../utilities/jwt.js";
import UnauthorizedError from "../errors/unauthorized.js";
import Token from "../models/Token.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const authenticateUser = async (req, res, next) => {
  // check for the tokens in the request obj

  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = verifyToken(accessToken);

      req.user = payload.user;
      return next();
    }
    //Verify refresh token
    const payload = verifyToken(refreshToken);
    //ensures that refresh token matches the token created when they first logged in(check login fn in authController)
    const tokenExists = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!tokenExists || !tokenExists?.isValid) {
      throw new UnauthenticatedError("Authentication fail");
    }
    //use refresh token to generate new tokens and attach them to response
    attachCookies({
      res,
      user: payload.user,
      refreshToken: tokenExists.refreshToken,
    });
    // adding user info to request object check -https://dev.to/cesareferrari/working-with-the-request-object-in-express-js-obd for more explanation on the topic.
    req.user = payload.user;

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication fail");
  }
};

const checkPrivileges = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role.includes(roles)) {
      throw new UnauthorizedError("This action is not allowed");
    }
    //pass to next fn
    next();
  };
};

//generate access token for daraja
const generateAccessToken = async (req, res, next) => {
  //base64 encode consumer key and consumer secret
  const credentials = new Buffer.from(
    `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
  ).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${credentials}`,
        },
      }
    );
    console.log(response.data.access_token);
    req.accessToken = response.data.access_token;

    next();
  } catch (error) {
    console.log("error");
  }
};

export { authenticateUser, checkPrivileges, generateAccessToken };
