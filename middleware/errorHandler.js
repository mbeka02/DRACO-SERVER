import CustomAPIError from "../errors/custom-api.js";

import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  // console.log(err);
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong please try again",
  };
  //if (err instanceof CustomAPIError) {
  // return res.status(err.statusCode).json({ msg: err.message });
  // }
  //used in scenarios where a given field must be unique
  if (err.code && err.code === 11000) {
    customError.msg = `The value ${Object.values(
      err.keyValue
    )} already exists , please try using another value`;
    customError.statusCode = 400;
  }
  //custom 404 message
  if (err.name === "CastError") {
    customError.msg = `No value with id:${err.value}`;
    customError.statusCode = 404;
  }
  //joins validation errors into one string
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  return res.status(customError.statusCode).json({ msg: customError.msg });
  //console.log(err);
  //next()
};

export default errorHandlerMiddleware;
