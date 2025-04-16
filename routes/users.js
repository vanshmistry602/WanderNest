const express = require("express");
const router = express.Router({ mergeParams: true });
const ErrorHandler = require("../utils/ErrorHandler.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

// Signup Routes
router
	.route("/signup")
	.get(userController.renderSignUp)
	.post(ErrorHandler(userController.postSignUp));

// Login Routes
router
	.route("/login")
	.get(userController.renderLogin)
	.post(
		saveRedirectUrl,
		passport.authenticate("local", {
			failureRedirect: "/login",
			failureFlash: true,
		}),
		ErrorHandler(userController.postLogin)
	);

// Logout Routes
router.get("/logout", userController.logout);

module.exports = router;
