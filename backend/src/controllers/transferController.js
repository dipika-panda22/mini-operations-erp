const { Transfer, Inventory, Item, Location } = require("../models");
const sequelize = require("../config/database");

// Create Transfer
const createTransfer = async (req, res) => {
    try {
        const {
            sourceLocationId,
            destinationLocationId,
            itemId,
            quantity
        } = req.body;

        if (
            !sourceLocationId ||
            !destinationLocationId ||
            !itemId ||
            !quantity
        ) {
            return res.status(400).json({
                message:
                    "sourceLocationId, destinationLocationId, itemId and quantity are required"
            });
        }

        if (sourceLocationId === destinationLocationId) {
            return res.status(400).json({
                message: "Source and destination locations must be different"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const sourceLocation = await Location.findByPk(sourceLocationId);
        const destinationLocation = await Location.findByPk(
            destinationLocationId
        );
        const item = await Item.findByPk(itemId);

        if (!sourceLocation || !destinationLocation || !item) {
            return res.status(404).json({
                message: "Item or location not found"
            });
        }

        const transfer = await Transfer.create({
            sourceLocationId,
            destinationLocationId,
            itemId,
            quantity,
            status: "Requested"
        });

        res.status(201).json({
            message: "Transfer created successfully",
            transfer
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create transfer",
            error: error.message
        });
    }
};


// Dispatch Transfer
const dispatchTransfer = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const transfer = await Transfer.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!transfer) {
            await transaction.rollback();
            return res.status(404).json({
                message: "Transfer not found"
            });
        }

        if (transfer.status !== "Requested") {
            await transaction.rollback();
            return res.status(400).json({
                message: "Only Requested transfers can be dispatched"
            });
        }

        const inventory = await Inventory.findOne({
            where: {
                itemId: transfer.itemId,
                locationId: transfer.sourceLocationId
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!inventory) {
            await transaction.rollback();
            return res.status(400).json({
                message: "No inventory found at source location"
            });
        }

        const availableQuantity =
            inventory.physicalQuantity - inventory.reservedQuantity;

        if (availableQuantity < transfer.quantity) {
            await transaction.rollback();
            return res.status(400).json({
                message: "Insufficient available inventory"
            });
        }

        // Reduce source stock only during dispatch
        inventory.physicalQuantity -= transfer.quantity;
        await inventory.save({ transaction });

        transfer.status = "Dispatched";
        await transfer.save({ transaction });

        await transaction.commit();

        res.json({
            message: "Transfer dispatched successfully",
            transfer
        });
    } catch (error) {
        await transaction.rollback();

        res.status(500).json({
            message: "Failed to dispatch transfer",
            error: error.message
        });
    }
};


// Receive Transfer
const receiveTransfer = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const transfer = await Transfer.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!transfer) {
            await transaction.rollback();
            return res.status(404).json({
                message: "Transfer not found"
            });
        }

        if (transfer.status !== "Dispatched") {
            await transaction.rollback();
            return res.status(400).json({
                message:
                    "Only Dispatched transfers can be received"
            });
        }

        let destinationInventory = await Inventory.findOne({
            where: {
                itemId: transfer.itemId,
                locationId: transfer.destinationLocationId
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!destinationInventory) {
            destinationInventory = await Inventory.create(
                {
                    itemId: transfer.itemId,
                    locationId: transfer.destinationLocationId,
                    batch: `TRANSFER-${transfer.id}`,
                    physicalQuantity: 0,
                    reservedQuantity: 0
                },
                { transaction }
            );
        }

        // Increase destination stock only during receipt
        destinationInventory.physicalQuantity += transfer.quantity;

        await destinationInventory.save({ transaction });

        transfer.status = "Received";
        await transfer.save({ transaction });

        await transaction.commit();

        res.json({
            message: "Transfer received successfully",
            transfer
        });
    } catch (error) {
        await transaction.rollback();

        res.status(500).json({
            message: "Failed to receive transfer",
            error: error.message
        });
    }
};


// Get all transfers
const getTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.findAll({
            include: [
                { model: Item },
                { model: Location, as: "SourceLocation" },
                { model: Location, as: "DestinationLocation" }
            ]
        });

        res.json(transfers);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transfers",
            error: error.message
        });
    }
};


module.exports = {
    createTransfer,
    dispatchTransfer,
    receiveTransfer,
    getTransfers
};