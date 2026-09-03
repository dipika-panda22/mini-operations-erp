const { Inventory, Item, Location } = require("../models");

// Create inventory
const createInventory = async (req, res) => {
    try {
        const {
            itemId,
            locationId,
            batch,
            physicalQuantity,
            reservedQuantity
        } = req.body;

        if (!itemId || !locationId || !batch || physicalQuantity === undefined) {
            return res.status(400).json({
                message: "itemId, locationId, batch and physicalQuantity are required"
            });
        }

        if (physicalQuantity < 0) {
            return res.status(400).json({
                message: "Physical quantity cannot be negative"
            });
        }

        if (reservedQuantity !== undefined && reservedQuantity < 0) {
            return res.status(400).json({
                message: "Reserved quantity cannot be negative"
            });
        }

        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const location = await Location.findByPk(locationId);
        if (!location) {
            return res.status(404).json({
                message: "Location not found"
            });
        }

        const reserved = reservedQuantity || 0;

        if (reserved > physicalQuantity) {
            return res.status(400).json({
                message: "Reserved quantity cannot exceed physical quantity"
            });
        }

        const inventory = await Inventory.create({
            itemId,
            locationId,
            batch,
            physicalQuantity,
            reservedQuantity: reserved
        });

        res.status(201).json({
            message: "Inventory created successfully",
            inventory: {
                ...inventory.toJSON(),
                availableQuantity:
                    inventory.physicalQuantity - inventory.reservedQuantity
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create inventory",
            error: error.message
        });
    }
};

// Get all inventory
const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findAll({
            include: [
                { model: Item },
                { model: Location }
            ]
        });

        const result = inventory.map((stock) => ({
            ...stock.toJSON(),
            availableQuantity:
                stock.physicalQuantity - stock.reservedQuantity
        }));

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch inventory",
            error: error.message
        });
    }
};

module.exports = {
    createInventory,
    getInventory
};