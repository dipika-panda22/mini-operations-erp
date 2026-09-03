const { WorkOrder, Item, Location, User, Inventory } = require("../models");

// Create Work Order
const createWorkOrder = async (req, res) => {
    try {
        const {
            locationId,
            itemId,
            requiredQuantity,
            assignedUserId
        } = req.body;

        if (!locationId || !itemId || !requiredQuantity || !assignedUserId) {
            return res.status(400).json({
                message: "locationId, itemId, requiredQuantity and assignedUserId are required"
            });
        }

        if (requiredQuantity <= 0) {
            return res.status(400).json({
                message: "Required quantity must be greater than 0"
            });
        }

        const location = await Location.findByPk(locationId);
        if (!location) {
            return res.status(404).json({
                message: "Location not found"
            });
        }

        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const assignedUser = await User.findByPk(assignedUserId);
        if (!assignedUser) {
            return res.status(404).json({
                message: "Assigned user not found"
            });
        }

        // Find inventory for this item at this location
        const inventory = await Inventory.findAll({
            where: {
                itemId,
                locationId
            }
        });

        const availableQuantity = inventory.reduce(
            (total, stock) =>
                total + (stock.physicalQuantity - stock.reservedQuantity),
            0
        );

        const shortage = Math.max(
            requiredQuantity - availableQuantity,
            0
        );

        const workOrder = await WorkOrder.create({
            locationId,
            itemId,
            requiredQuantity,
            assignedUserId,
            status: "Assigned"
        });

        res.status(201).json({
            message: "Work Order created successfully",
            workOrder: {
                ...workOrder.toJSON(),
                availableQuantity,
                shortage
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create Work Order",
            error: error.message
        });
    }
};


// Get all Work Orders
const getWorkOrders = async (req, res) => {
    try {
        const workOrders = await WorkOrder.findAll({
            include: [
                { model: Item },
                { model: Location },
                { model: User }
            ]
        });

        res.json(workOrders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch Work Orders",
            error: error.message
        });
    }
};

// Update Work Order status
const updateWorkOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Assigned",
            "In Progress",
            "Completed"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const workOrder = await WorkOrder.findByPk(id);

        if (!workOrder) {
            return res.status(404).json({
                message: "Work Order not found"
            });
        }

        workOrder.status = status;

        await workOrder.save();

        res.json({
            message: "Work Order status updated successfully",
            workOrder
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update Work Order status",
            error: error.message
        });
    }
};

module.exports = {
    createWorkOrder,
    getWorkOrders,
    updateWorkOrderStatus
};