import { User } from "../models/User.js";
import sharp from "sharp";
import { StatusCodes } from "http-status-codes";

import * as url from "url";
import BadRequestError from "../errors/bad-request.js";
import UnauthorizedError from "../errors/unauthorized.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
import { unlink } from "fs";

const updateProfile = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    { _id: req.user.userId },
    req.body,
    { runValidators: true }
  );

  if (!user) {
    throw new BadRequestError(
      "Unable to find and update your account details, please try again"
    );
  }
  res.status(StatusCodes.OK).json({ msg: "Details updated" });
};

const uploadImage = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  unlink(`./${user.avatarUrl}`, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("file deleted");
  });
  try {
    await sharp(req.file.buffer)
      //   .resize({ width: 200, height: 200 })
      .png()
      .toFile(/*__dirname +*/ `./images/${req.file.originalname}`);
    console.log("new file added");

    user.avatarUrl = `/images/${req.file.originalname}`;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: "profile picture updated" });
  } catch (error) {
    //console.log(error);
    //res.status(StatusCodes.BAD_REQUEST).send(error);
    throw new BadRequestError(error);
  }
};

const getAvatar = async (req, res) => {
  const avatar = await User.findOne({ _id: req.user.userId }).select(
    "avatarUrl  name"
  );
  res.status(StatusCodes.OK).json({ avatar });
};

const getProfile = async (req, res) => {
  const profile = await User.findOne({ _id: req.user.userId }).select(
    "-password"
  );
  res.status(StatusCodes.OK).json({ profile });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Fields cannot be empty");
  }

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new BadRequestError(
      "An error has occured, acount details could not be found"
    );
  }
  //check if old password is valid
  const isValid = await user.verifyPassword(oldPassword);

  if (!isValid) {
    throw new UnauthorizedError("The input password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated" });
};

export {
  uploadImage,
  getAvatar,
  getProfile,
  showCurrentUser,
  updatePassword,
  updateProfile,
};
