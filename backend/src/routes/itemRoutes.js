const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createItem,
    getItems
} = require("../controllers/itemController");

const router = express.Router();

// Create Item
router.post(
    "/",
    authenticate,
    authorize("Admin"),
    createItem
);

// Get Items
router.get(
    "/",
    authenticate,
    getItems
);

module.exports = router;