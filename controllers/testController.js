import { StatusCodes } from "http-status-codes";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import BadRequestError from "../errors/bad-request.js";
//import { Tutor } from "../models/User.js";

const createPost = async (req, res) => {
  const { title, description, topic } = req.body;

  const post = await Post.create({
    title,
    description,
    topic,
    user: req.user.userId,
    createdBy: req.user.name,
  });
  res.status(StatusCodes.CREATED).json({ post });
};

const getUserPost = async (req, res) => {
  const posts = await Post.find({ user: req.user.userId }).sort({
    createdAt: "desc",
  });

  if (!posts) {
    throw new BadRequestError("Unable to find any posts , please try again");
  }

  res.status(StatusCodes.OK).json({ posts });
};
const getAllPosts = async (req, res) => {
  const posts = await Post.find({}).sort({ createdAt: "desc" });
  res.status(StatusCodes.OK).json({ posts });
};

const createComment = async (req, res) => {
  const { id: postId } = req.params;
  const { text } = req.body;

  const post = await Post.findOne({ _id: postId });

  if (!post) {
    throw new BadRequestError(
      "Unable to find the post your looking for , it might've been deleted or moved."
    );
  }
  const newComment = await Comment.create({
    text,
    post: postId,
    createdBy: req.user.name,
    role: req.user.role,
    user: req.user.userId,
  });

  post.comment.push(newComment);
  await post.save();
  res.status(StatusCodes.CREATED).json({ newComment });
};

const getAllPostComments = async (req, res) => {
  const { id: postId } = req.params;
  const postComments = await Post.findOne({ _id: postId }).populate("comment");

  if (!postComments) {
    throw new BadRequestError("Unable to find anything, please try again");
  }

  res.status(StatusCodes.OK).json({ postComments });
};

const deletePostComment = async (req, res) => {
  const { id: postId, commentId: commentId } = req.params;

  const comment = await Comment.deleteOne({
    post: postId,
    user: req.user.userId,
    _id: commentId,
  });
  if (!comment) {
    throw new BadRequestError("Something went wrong , try again");
  }
  res.status(StatusCodes.OK).json({ msg: "Comment deleted" });
};
const updatePostComment = async (req, res) => {
  const { id: postId, commentId: commentId } = req.params;

  const comment = await Comment.findOneAndUpdate(
    { post: postId, user: req.user.userId, _id: commentId },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );
  if (!comment) {
    throw new BadRequestError("Something went wrong , try again");
  }
  res.status(StatusCodes.OK).json({ comment });
};

const ratingsTest = async (req, res) => {
  /*const { rating } = req.body;

  if (!rating) {
    throw new BadRequestError("No rating entered");
  }

  const tutorRating = await Tutor.create({ rating });
  res.status(StatusCodes.CREATED).json({ tutorRating });*/
};

export {
  createPost,
  getAllPosts,
  getUserPost,
  createComment,
  getAllPostComments,
  deletePostComment,
  updatePostComment,
  ratingsTest,
};
