const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, " a post must have a title"],
  },
  body: {
    type: String,
    required: [true, "a post must have a body"],
  },
  photo: {
    type: String,
    required: [true, "a post must have a picture"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      text: {
        type: String,
      },
      postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],

  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
