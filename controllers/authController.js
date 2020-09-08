const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const Email = require("../utils/email");
const bcrypt = require("bcryptjs");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
const cookieOptions = {
  expires: new Date(Date.now() + process.env.EXPIRES_IN * 24 * 60 * 60 * 1000),
  httpOnly: true,
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions);

  //localStorage.setItem("jwt", token);
  user.password = undefined;
  return res.status(statusCode).json({
    status: "success",
    message: "Welcome ",
    token,
    user,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const { email, name, password, confirmPassword } = req.body;
  const user = await User.findOne({ email });
  if (user)
    return res.status(400).json({
      status: "fail",
      message: "this email is all ready used please try to log in",
    });
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    photo: req.body.photo,
  });
  const url = `${req.protocol}://${req.get("host")}/profile`;
  await new Email(newUser, url).sendwelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      status: "fail",
      message: "please provide the email and password",
    });

  const user = await User.findOne({ email }).select("+password");

  const correctPassword = await bcrypt.compare(password, user.password);
  if (!user || !correctPassword) {
    return res.status(400).json({
      status: "fail",
      message: "the email or the password are not correct",
    });
  }
  createSendToken(user, 201, res);
});

exports.userLogout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("your are not logged in", 404));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError("this user no more exist", 404));
  req.user = user;

  next();
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("we can not found a user with this email", 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validationBeforeSave: false });

  try {
    const url = `${req.protocol}://127.0.0.1:3000/resetPassword/${resetToken}`;

    await new Email(user, url).sendResetPasswordToken();
    res.status(200).json({
      status: "success",
      message: "Token send successfuly please verify your email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validationBeforeSave: false });
    return next(new AppError("there is an error sending this email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("the token is invalid or has been expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "password updated successfully please try to login",
  });
});
