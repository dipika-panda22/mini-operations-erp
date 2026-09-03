const { CustomerOrder, Inventory, Item, Location } = require("../models");
const sequelize = require("../config/database");

// Create Customer Order and reserve stock
const createCustomerOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            itemId,
            locationId,
            quantity
        } = req.body;

        if (!itemId || !locationId || !quantity) {
            await transaction.rollback();

            return res.status(400).json({
                message: "itemId, locationId and quantity are required"
            });
        }

        if (quantity <= 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const item = await Item.findByPk(itemId, {
            transaction
        });

        if (!item) {
            await transaction.rollback();

            return res.status(404).json({
                message: "Item not found"
            });
        }

        const location = await Location.findByPk(locationId, {
            transaction
        });

        if (!location) {
            await transaction.rollback();

            return res.status(404).json({
                message: "Location not found"
            });
        }

        // Lock inventory row during reservation
        const inventory = await Inventory.findOne({
            where: {
                itemId,
                locationId
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!inventory) {
            await transaction.rollback();

            return res.status(400).json({
                message: "No inventory found for this item at this location"
            });
        }

        const availableQuantity =
            inventory.physicalQuantity - inventory.reservedQuantity;

        // Prevent over-reservation
        if (quantity > availableQuantity) {
            await transaction.rollback();

            return res.status(400).json({
                message: "Insufficient available inventory",
                availableQuantity
            });
        }

        // Reserve the stock
        inventory.reservedQuantity += quantity;

        await inventory.save({
            transaction
        });

        // Create customer order
        const order = await CustomerOrder.create(
            {
                itemId,
                locationId,
                quantity,
                status: "Reserved"
            },
            {
                transaction
            }
        );

        await transaction.commit();

        res.status(201).json({
            message: "Customer order created and stock reserved successfully",
            order,
            inventory: {
                physicalQuantity: inventory.physicalQuantity,
                reservedQuantity: inventory.reservedQuantity,
                availableQuantity:
                    inventory.physicalQuantity -
                    inventory.reservedQuantity
            }
        });

    } catch (error) {
        await transaction.rollback();

        res.status(500).json({
            message: "Failed to create customer order",
            error: error.message
        });
    }
};


// Get all Customer Orders
const getCustomerOrders = async (req, res) => {
    try {
        const orders = await CustomerOrder.findAll({
            include: [
                { model: Item },
                { model: Location }
            ]
        });

        res.json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch customer orders",
            error: error.message
        });
    }
};

// Cancel Customer Order and release reserved stock
const cancelCustomerOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const order = await CustomerOrder.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!order) {
            await transaction.rollback();

            return res.status(404).json({
                message: "Customer order not found"
            });
        }

        if (order.status !== "Reserved") {
            await transaction.rollback();

            return res.status(400).json({
                message: "Only Reserved orders can be cancelled"
            });
        }

        const inventory = await Inventory.findOne({
            where: {
                itemId: order.itemId,
                locationId: order.locationId
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!inventory) {
            await transaction.rollback();

            return res.status(400).json({
                message: "Inventory not found"
            });
        }

        if (inventory.reservedQuantity < order.quantity) {
            await transaction.rollback();

            return res.status(400).json({
                message: "Reserved stock is insufficient to release"
            });
        }

        // Release reserved stock
        inventory.reservedQuantity -= order.quantity;

        await inventory.save({
            transaction
        });

        // Cancel order
        order.status = "Cancelled";

        await order.save({
            transaction
        });

        await transaction.commit();

        res.json({
            message: "Customer order cancelled and reserved stock released successfully",
            order,
            inventory: {
                physicalQuantity: inventory.physicalQuantity,
                reservedQuantity: inventory.reservedQuantity,
                availableQuantity:
                    inventory.physicalQuantity -
                    inventory.reservedQuantity
            }
        });

    } catch (error) {
        await transaction.rollback();

        res.status(500).json({
            message: "Failed to cancel customer order",
            error: error.message
        });
    }
};

module.exports = {
    createCustomerOrder,
    getCustomerOrders,
    cancelCustomerOrder
};