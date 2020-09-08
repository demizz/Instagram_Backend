const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);

router.route("/forgot-password").post(authController.forgotPassword);
router.route("/resetPassword/:token").post(authController.resetPassword);
router.use(authController.protect);
router.route("/search-users").post(userController.searchUsers);
router.route("/myProfile").get(userController.getMyProfile);
router.route("/user/:id").get(userController.getUserById);
router.route("/Allusers").get(userController.getAllusers);
router.route("/mySubPost").get(userController.mySubPost);
router.route("/follow").put(userController.follow);
router.route("/unfollow").put(userController.unfollow);
router.route("/updatePhoto").put(userController.updatePhoto);
router.route("/logout").get(authController.userLogout);
module.exports = router;
