const express = require("express");
const router = express.Router({ mergeParams: true });
const ErrorHandler = require("../utils/ErrorHandler.js");
const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// Post Review Route
router.post(
	"/",
	isLoggedIn,
	validateReview,
	ErrorHandler(reviewController.createReview)
);

// Delete Review Route
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	ErrorHandler(reviewController.deleteReview)
);

module.exports = router;
