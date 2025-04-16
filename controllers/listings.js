const Listing = require("../models/listing.js");
const { faker } = require("@faker-js/faker");
// Function to generate a random listing data
function createRandomListing() {
	return {
		title: faker.location.city(),
		description: faker.lorem.paragraph(),
		image: faker.image.url(),
		price: faker.number.int(10000),
		location: faker.location.streetAddress({ useFullAddress: true }),
		country: faker.location.country(),
	};
}

// Index [Render]
module.exports.index = async (req, res) => {
	const allListings = await Listing.find({});
	res.render("listings/index.ejs", { allListings });
};

// New [Render]
module.exports.renderNewForm = (req, res) => {
	res.render("listings/new.ejs", { randomData: createRandomListing() });
};

// Create [POST]
module.exports.createListing = async (req, res, next) => {
	const newListing = new Listing(req.body.listing);
	const { path: url, filename } = req.file;
	newListing.owner = req.user._id;
	newListing.image = { url, filename };
	await newListing.save();
	req.flash("success", "New listing created!");
	res.redirect("/listings");
};

// Show [Render]
module.exports.renderShowListing = async (req, res) => {
	const { id } = req.params;
	const listingData = await Listing.findById(id)
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		})
		.populate("owner");
	if (!listingData) {
		req.flash("error", "Listing not found.");
		res.redirect("/listings");
	}
	res.render("listings/show.ejs", { listingData });
};

// Edit [Render]
module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const listingData = await Listing.findById(id);
	if (!listingData) {
		req.flash("error", "Listing not found.");
		res.redirect("/listings");
	}
	let modifiedUrl = listingData.image.url.replace(
		"/upload",
		"/upload/h_100,w_200"
	);
	res.render("listings/edit.ejs", { listingData, modifiedUrl });
};

// Update [PUT]
module.exports.updateListing = async (req, res) => {
	const { id } = req.params;
	let updatedListing = await Listing.findByIdAndUpdate(id, {
		...req.body.listing,
	});
	if (typeof req.file != "undefined") {
		const { path: url, filename } = req.file;
		updatedListing.image = { url, filename };
		await updatedListing.save();
	}
	req.flash("success", "Listing updated!");
	res.redirect(`/listings/${id}`);
};

// Delete [DELETE]
module.exports.deleteListing = async (req, res) => {
	const { id } = req.params;
	await Listing.findByIdAndDelete(id);
	req.flash("success", "Listing deleted.");
	res.redirect(`/listings`);
};
