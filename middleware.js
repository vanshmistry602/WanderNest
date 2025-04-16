const axios = require("axios");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const WanderNestError = require("./utils/WanderNestError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");

const MAPPLES_MAP_API_ACCESS_TOKEN = "131b3456-07f2-40b3-ac10-8de4f663dfe7";
const MAPPLES_MAP_API_BASE_URL = "https://atlas.mappls.com/api/places/geocode";

// To validate listing schema
module.exports.validateListing = (req, res, next) => {
	let { error } = listingSchema.validate(req.body);
	if (error) {
		let errorMessage = error.details
			.map((element) => element.message)
			.join(",");
		throw new WanderNestError(400, errorMessage);
	} else {
		next();
	}
};

// To validate review schema
module.exports.validateReview = (req, res, next) => {
	let { error } = reviewSchema.validate(req.body);
	if (error) {
		let errorMessage = error.details
			.map((element) => element.message)
			.join(",");
		throw new WanderNestError(400, errorMessage);
	} else {
		next();
	}
};

// To check user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.redirectUrl = req.originalUrl;
		req.flash("error", "You must be logged in.");
		return res.redirect("/login");
	}
	next();
};

// To save redirect url
module.exports.saveRedirectUrl = (req, res, next) => {
	if (req.session.redirectUrl) {
		res.locals.redirectUrl = req.session.redirectUrl;
	}
	next();
};

// To verify user is owner of listing or not
module.exports.isOwner = async (req, res, next) => {
	try {
		const { id } = req.params;
		let listingResult = await Listing.findById(id);
		if (
			res.locals.currentUser._id &&
			!res.locals.currentUser._id.equals(listingResult.owner._id)
		) {
			req.flash("error", "Access denied.");
			return res.redirect(`/listings/${id}`);
		}
		next();
	} catch (error) {
		next(error);
	}
};

// To verify user is owner of review or not
module.exports.isReviewAuthor = async (req, res, next) => {
	try {
		const { id, reviewId } = req.params;
		let reviewResult = await Review.findById(reviewId);
		if (
			res.locals.currentUser._id &&
			!res.locals.currentUser._id.equals(reviewResult.author._id)
		) {
			req.flash("error", "Access denied.");
			return res.redirect(`/listings/${id}`);
		}
		next();
	} catch (error) {
		next(error);
	}
};

const getCoordinates = async (eLoc) => {
	try {
		const response = await axios.get(
			`https://explore.mappls.com/apis/O2O/entity/${eLoc}`,
			{
				headers: {
					Authorization: `Bearer ${MAPPLES_MAP_API_ACCESS_TOKEN}`,
				},
			}
		);
		console.log(response);

		if (response.data && response.data.latitude && response.data.longitude) {
			console.log(
				`Latitude: ${response.data.latitude}, Longitude: ${response.data.longitude}`
			);
			return { lat: response.data.latitude, lng: response.data.longitude };
		} else {
			console.log("Latitude and Longitude not found in response.");
		}
	} catch (error) {
		console.error(
			"Error fetching coordinates:",
			error.response ? error.response.data : error.message
		);
	}
};

module.exports.getGeocode = async (address, region = "ind", itemCount = 1) => {
	try {
		const response = await axios.get(MAPPLES_MAP_API_BASE_URL, {
			headers: {
				Authorization: `Bearer ${MAPPLES_MAP_API_ACCESS_TOKEN}`,
			},
			params: {
				address: address,
				region: region,
				itemCount: itemCount,
			},
		});

		console.log("Geocode Response:", response.data.copResults.eLoc);
		if (response.data.copResults.eLoc) {
			return getCoordinates(response.data.copResults.eLoc);
		}
	} catch (error) {
		console.error(
			"Error fetching geocode:",
			error.response ? error.response.data : error.message
		);
	}
};
