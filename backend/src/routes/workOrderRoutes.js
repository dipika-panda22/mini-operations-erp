const express = require("express");
const {
    createWorkOrder,
    getWorkOrders,
    updateWorkOrderStatus
} = require("../controllers/workOrderController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all Work Orders
router.get("/", authenticate, getWorkOrders);

// Only Admin can create Work Orders
router.post(
    "/",
    authenticate,
    authorize("Admin"),
    createWorkOrder
);

module.exports = router;
router.put(
    "/:id/status",
    authenticate,
    authorize("Admin", "Operations User"),
    updateWorkOrderStatus
);