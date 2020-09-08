const Post = require("./../models/postModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");

exports.createpost = catchAsync(async (req, res, next) => {
  if (!req.body.title || !req.body.body || !req.body.photo) {
    return next(new AppError("title  body and the photo are required", 400));
  }

  const post = await Post.create({
    title: req.body.title,
    body: req.body.body,
    photo: req.body.photo,
    postedBy: req.user.id,
  });

  res.status(201).json({
    status: "success",
    message: "post posted successfuly",
    data: {
      data: post,
    },
  });
});
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    length: posts.length,
    posts,
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const doc = await Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", " name ");
  if (!doc) {
    next(new AppError("no document found with this id", 404));
  }
  res.status(200).json({
    status: "success",
    doc,
  });
});
exports.unlikePost = catchAsync(async (req, res, next) => {
  const doc = await Post.findByIdAndUpdate(
    req.body.postId,
    { $pop: { likes: 1 } },
    { new: true }
  )
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", " name ");
  if (!doc) {
    next(new AppError("no document found with this id", 404));
  }
  res.status(200).json({
    status: "success",
    doc,
  });
});
exports.commentPost = catchAsync(async (req, res, next) => {
  const { text, postId } = req.body.comment;
  const doc = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: { text, postedBy: req.user._id } } },
    { new: true }
  )
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", " name ");
  if (!doc) {
    next(new AppError("no document found with this id", 404));
  }
  res.status(200).json({
    status: "success",
    doc,
  });
});
exports.deletePost = catchAsync(async (req, res, next) => {
  const doc = await Post.findById(req.params.postId).populate(
    "postedBy",
    "_id"
  );

  if (!doc) {
    return next(new AppError("we can not find a doc with that id", 404));
  }

  if (doc.postedBy._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError("you don't have permission to delete this post", 400)
    );
  }
  const doc2 = await Post.findByIdAndDelete(req.params.postId);
  if (!doc2) {
    return next(new AppError("we can not remove this doc", 400));
  }
  res.status(404).json({
    status: "success",
    message: "post deleted successfully",
    data: null,
  });
});
