const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide the name"],
  },
  email: {
    type: String,
    required: [true, "please provide the email"],
    unique: true,
    validate: [validator.isEmail, "please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "please provide the password"],
    minlength: 8,
    select: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  confirmPassword: {
    type: String,
    requird: [true, "please provide the same password"],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: "the password are not the same",
    },
  },
  photo: {
    type: String,
    default:
      "https://res.cloudinary.com/de8wrgyph/image/upload/v1597605794/default_q6kzcv.jpg",
  },
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "USER",
    },
  ],
  followings: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "USER",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
