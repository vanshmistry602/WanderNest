const express = require("express");
const router = express.Router({ mergeParams: true });
const ErrorHandler = require("../utils/ErrorHandler.js");
const settingsController = require("../controllers/settings.js");

router.get("/settings", settingsController.renderSettings);

router.get("/settings/init", ErrorHandler(settingsController.settingsInit));

module.exports = router;
