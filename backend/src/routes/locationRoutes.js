const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createLocation,
    getLocations
} = require("../controllers/locationController");

const router = express.Router();

// Create Location
router.post(
    "/",
    authenticate,
    authorize("Admin"),
    createLocation
);

// Get Locations
router.get(
    "/",
    authenticate,
    getLocations
);

module.exports = router;