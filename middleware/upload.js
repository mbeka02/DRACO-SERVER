import multer from "multer";
import BadRequestError from "../errors/bad-request.js";
//import path from "path";

//import * as url from "url";
//const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./documents");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      /*req.user.userId +*/ file.originalname /*.trim().split(/\s+/).join("_")*/
    );
  },
});

const fileUpload = multer({ storage: storage });

const imageUpload = multer({
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

export { imageUpload, fileUpload };
