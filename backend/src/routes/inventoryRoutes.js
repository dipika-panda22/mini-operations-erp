const express = require("express");
const {
    createInventory,
    getInventory
} = require("../controllers/inventoryController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get inventory
router.get("/", authenticate, getInventory);

// Create inventory - Admin and Operations User
router.post(
    "/",
    authenticate,
    authorize("Admin", "Operations User"),
    createInventory
);

module.exports = router;