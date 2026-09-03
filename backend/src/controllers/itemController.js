const { Item } = require("../models");

const createItem = async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                message: "Item name and category are required"
            });
        }

        const item = await Item.create({
            name,
            category
        });

        res.status(201).json({
            message: "Item created successfully",
            item
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create item",
            error: error.message
        });
    }
};

const getItems = async (req, res) => {
    try {
        const items = await Item.findAll({
            order: [["id", "ASC"]]
        });

        res.json(items);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch items",
            error: error.message
        });
    }
};

module.exports = {
    createItem,
    getItems
};