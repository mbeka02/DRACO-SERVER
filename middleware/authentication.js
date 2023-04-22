import UnauthenticatedError from "../errors/unauthenticated.js";
import { attachCookies, verifyToken } from "../utilities/jwt.js";
import UnauthorizedError from "../errors/unauthorized.js";
import Token from "../models/Token.js";
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

export { authenticateUser, checkPrivileges };
