const User = require("../models/userModel");
const Post = require("../models/postModel");
const Email = require("../utils/email");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getMyProfile = catchAsync(async (req, res, next) => {
  const doc = await Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name");

  res.status(200).json({
    status: "success",
    doc,
  });
});
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("this user is not found", 404));
  }
  const userPosts = await Post.find({ postedBy: req.params.id });
  if (!userPosts) {
    return next(new AppError("this user has not posts yet", 404));
  }

  res.status(200).json({
    status: "success",
    message: "posts for this user found successfuly",
    data: {
      user,
      userPosts,
    },
  });
});
exports.getAllusers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      data: users,
    },
  });
});
exports.follow = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(
    req.body.userId,
    { $push: { followers: req.user._id } },
    { new: true }
  );
  if (!doc) {
    return next(new AppError("fail to update this user", 404));
  }
  const doc2 = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { followings: req.body.userId } },
    { new: true }
  );
  if (!doc2) {
    return next(new AppError("fail to update the current user", 404));
  }
  return res.status(200).json({
    status: "success",
    message: "both users are updated",
    data: {
      doc,
      doc2,
    },
  });
});
exports.unfollow = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(
    req.body.userId,
    { $pop: { followers: 1 } },
    { new: true }
  );
  if (!doc) {
    return next(new AppError("fail to update this user", 404));
  }
  const doc2 = await User.findByIdAndUpdate(
    req.user._id,
    { $pop: { followings: 1 } },
    { new: true }
  );
  if (!doc2) {
    return next(new AppError("fail to update the current user", 404));
  }
  return res.status(200).json({
    status: "success",
    message: "both users are updated",
    data: {
      doc,
      doc2,
    },
  });
});
exports.mySubPost = catchAsync(async (req, res, next) => {
  const doc = await Post.find({
    postedBy: { $in: req.user.followings },
  })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name");
  if (!doc) {
    return next(
      new AppError("we can not found the posts of your followings", 404)
    );
  }
  res.status(200).json({
    status: "success",
    doc,
  });
});
exports.updatePhoto = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { photo: req.body.photo },
    },
    { new: true, runValidators: true }
  );
  if (!doc) {
    return next(new AppError("fail to update the photo", 404));
  }
  res.status(200).json({
    status: "succes",
    message: "photo of this user updated successfully",
    data: {
      doc,
    },
  });
});
exports.searchUsers = catchAsync(async (req, res, next) => {
  const userPattern = new RegExp("^" + req.body.query);

  const users = await User.find({ email: { $regex: userPattern } }).select(
    "_id email"
  );
  if (!users) {
    return next(new AppError("we cant find any users", 404));
  }
  res.status(200).json({
    status: "success",
    message: "users find successfully",
    users,
  });
});
