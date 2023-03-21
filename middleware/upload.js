import multer from "multer";
import BadRequestError from "../errors/bad-request.js";

const upload = multer({
  //4 MB limit
  limits: {
    fileSize: 4000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(
        new BadRequestError(
          "Invalid image format only .jpg .jpeg and .png are allowed"
        )
      );
    }

    callback(undefined, true);
  },
});

export default upload;
