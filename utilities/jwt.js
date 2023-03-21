import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const createJWT = ({ payload }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

//attaches httpOnly cookies to response
const attachCookies = ({ res, user, refreshToken }) => {
  const ACCESSTOKEN = createJWT({ payload: { user } });
  const REFRESHTOKEN = createJWT({ payload: { user, refreshToken } });

  const tenMinutes = 1000 * 60 * 10;
  const oneDay = 1000 * 60 * 60 * 24;

  //access token should be short-lived approx. 10 minutes
  res.cookie("accessToken", ACCESSTOKEN, {
    httpOnly: true,
    expires: new Date(Date.now() + tenMinutes),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  res.cookie("refreshToken", REFRESHTOKEN, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};
export { createJWT, verifyToken, attachCookies };
