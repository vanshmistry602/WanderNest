const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res, next) => {
	const listingData = await Listing.findById(req.params.id);
	const newReview = new Review(req.body.review);
	newReview.author = req.user._id;
	listingData.reviews.push(newReview);
	await newReview.save();
	await listingData.save();
	req.flash("success", "New review created.");
	res.redirect("/listings/" + req.params.id);
};

module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Review deleted.");
	res.redirect("/listings/" + id);
};
