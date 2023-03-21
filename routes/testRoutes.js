import { Router } from "express";
import {
  createPost,
  getUserPost,
  createComment,
  getAllPostComments,
  deletePostComment,
  updatePostComment,
  getAllPosts,
  ratingsTest,
} from "../controllers/testController.js";

const router = Router();

router.route("/posts").get(getAllPosts).post(createPost);
router.route("/posts/myPosts").get(getUserPost);
router.route("/rating").post(ratingsTest);

router.route("/posts/:id").get(getAllPostComments).post(createComment);
router
  .route("/posts/:id/:commentId")
  .patch(updatePostComment)
  .delete(deletePostComment);

export default router;
