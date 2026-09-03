const express = require("express");

const {
    createCustomerOrder,
    getCustomerOrders,
    cancelCustomerOrder
} = require("../controllers/customerOrderController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all customer orders
router.get(
    "/",
    authenticate,
    getCustomerOrders
);

// Sales User and Admin can create customer orders
router.post(
    "/",
    authenticate,
    authorize("Sales User", "Admin"),
    createCustomerOrder
);

module.exports = router;
router.put(
    "/:id/cancel",
    authenticate,
    authorize("Sales User", "Admin"),
    cancelCustomerOrder
);