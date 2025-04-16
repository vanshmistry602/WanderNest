if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const WanderNestError = require("./utils/WanderNestError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const User = require("./models/user.js");

// Routes
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");
const appSettingsRouter = require("./routes/settings.js");

const app = express();
const PORT = process.env.PORT || 8081;
const DB_URL = process.env.ATLASDB_URL;

// Using a connect-mongo session, setting up it
const store = MongoStore.create({
	mongoUrl: DB_URL,
	crypto: {
		secret: process.env.SECRET,
	},
	touchAfter: 24 * 3600,
});

store.on("error", (error) => {
	console.log("Error in mongo session store", error);
});

// Setting up session options
const sessionOptions = {
	store,
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
	},
};

// Setting up EJS as a view engine
app.set("view engine", "ejs");
// Use EJSMate for EJS Templates
app.engine("ejs", ejsMate);
// Setting up views folder path
app.set("views", path.join(__dirname, "/views"));
// Parsing express request body data
app.use(express.urlencoded({ extended: true }));
// Parsing data to JSON format
app.use(express.json());
// override with POST having ?_method=
app.use(methodOverride("_method"));
// For Serving Static Files
app.use(express.static(path.join(__dirname, "/public")));
// Using session middleware
app.use(session(sessionOptions));
// Using flash
app.use(flash());
// Initializing a passport for every request
app.use(passport.initialize());
// Associating session with passport
app.use(passport.session());
// Authenticating every user with local strategy.
passport.use(new LocalStrategy(User.authenticate()));
// Use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connecting to mongodb
main()
	.then(() => console.log("Connected to database."))
	.catch((err) => console.log("❌ " + err));

// Async function made to connect to mongodb
async function main() {
	await mongoose.connect(DB_URL);
}

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currentUser = req.user;
	next();
});

// Main Route
app.get("/", (req, res) => {
	res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);
app.use("/", appSettingsRouter);

app.all("*", (req, res, next) => {
	next(new WanderNestError(404, "Page not found."));
});

// Custom error handling middleware
app.use((error, req, res, next) => {
	const { status = 500, message = "Internal server error." } = error;
	req.flash("error", message);
	res.status(status).redirect("/listings");
});

// Listing to port
app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});
