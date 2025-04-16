const express = require("express");
const router = express.Router({ mergeParams: true });
const ErrorHandler = require("../utils/ErrorHandler.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
// Setting up multer middleware to store files from form
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Listing view and create routes
router.route("/").get(ErrorHandler(listingController.index)).post(
	isLoggedIn,
	// validateListing,
	upload.single("listing[image]"),
	ErrorHandler(listingController.createListing)
);

// Listing new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Listing update and delete routes
router
	.route("/:id")
	.get(ErrorHandler(listingController.renderShowListing))
	.put(
		// validateListing,
		isLoggedIn,
		isOwner,
		upload.single("listing[image]"),
		ErrorHandler(listingController.updateListing)
	)
	.delete(isLoggedIn, isOwner, ErrorHandler(listingController.deleteListing));

// Listing Edit Route
router.get(
	"/:id/edit",
	isLoggedIn,
	isOwner,
	ErrorHandler(listingController.renderEditForm)
);

module.exports = router;
