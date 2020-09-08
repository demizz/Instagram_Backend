const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");

router.route("/").get(postController.getAllPosts);
router.use(authController.protect);
router.route("/home").get(postController.getAllPosts);

router.route("/create").post(postController.createpost);

router.route("/like").put(postController.likePost);
router.route("/unlike").put(postController.unlikePost);
router.route("/comment").put(postController.commentPost);
router.route("/delete/:postId").delete(postController.deletePost);
module.exports = router;
