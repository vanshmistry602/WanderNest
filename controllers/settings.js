const Listing = require("../models/listing.js");
const Reviews = require("../models/review.js");
const User = require("../models/user.js");
const dataObj = require("../data.js");

module.exports.renderSettings = (req, res) => {
	res.render("app/settings.ejs");
};

module.exports.settingsInit = async (req, res) => {
	await Listing.deleteMany({});
	await Reviews.deleteMany({});
	await User.deleteMany({});
	const username = "vanshmistry",
		email = "vansh@gmail.com",
		password = "123456789";
	const registeredUser = await User.register({ username, email }, password);
	const updatedData = dataObj.data.map((item) => ({
		...item,
		owner: registeredUser._id.toString(),
	}));

	await Listing.insertMany(updatedData);
	req.flash("success", "Database is initialized.");
	console.log("Database is initialized.");
	res.redirect("/settings");
};
