const User = require("../models/user.js");
const { faker } = require("@faker-js/faker");

// Create a random user
function generateFakeUser() {
	return {
		username:
			faker.person.firstName().toLowerCase() +
			faker.person.lastName().toLowerCase(),
		email: faker.internet.email().toLowerCase(),
		password: "123456789",
	};
}

module.exports.renderSignUp = (req, res) => {
	res.render("users/signup.ejs", { fakeUserData: generateFakeUser() });
};

module.exports.postSignUp = async (req, res, next) => {
	try {
		const { username, email, password } = req.body;
		const registeredUser = await User.register({ username, email }, password);
		req.login(registeredUser, (error) => {
			if (error) {
				return next(error);
			}
			req.flash("success", "User account registered successfully.");
			res.redirect("/listings");
		});
	} catch (error) {
		req.flash("error", error.message);
		res.redirect("/signup");
	}
};

module.exports.renderLogin = (req, res) => {
	res.render("users/login.ejs");
};

module.exports.postLogin = async (req, res) => {
	req.flash("success", "Login successful.");
	let redirectUrl = res.locals.redirectUrl || "/listings";
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
	req.logout((error) => {
		if (error) {
			return next(error);
		}
		req.flash("success", "Logout successful.");
		res.redirect("/listings");
	});
};
