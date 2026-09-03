const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createLocation } = require("../controllers/locationController");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("Admin"),
    createLocation
);

module.exports = router;