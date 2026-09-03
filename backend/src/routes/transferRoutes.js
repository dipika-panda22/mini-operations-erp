const express = require("express");

const {
    createTransfer,
    dispatchTransfer,
    receiveTransfer,
    getTransfers
} = require("../controllers/transferController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all transfers
router.get("/", authenticate, getTransfers);

// Create transfer
// Admin and Operations User
router.post(
    "/",
    authenticate,
    authorize("Admin", "Operations User"),
    createTransfer
);

// Dispatch transfer
// Operations User
router.put(
    "/:id/dispatch",
    authenticate,
    authorize("Admin", "Operations User"),
    dispatchTransfer
);

// Receive transfer
// Operations User
router.put(
    "/:id/receive",
    authenticate,
    authorize("Admin", "Operations User"),
    receiveTransfer
);

module.exports = router;