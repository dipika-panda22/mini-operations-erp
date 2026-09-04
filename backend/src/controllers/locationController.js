const { Location } = require("../models");

const createLocation = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Location name is required"
            });
        }

        const existingLocation = await Location.findOne({
            where: { name }
        });

        if (existingLocation) {
            return res.status(400).json({
                message: "Location already exists"
            });
        }

        const location = await Location.create({
            name
        });

        res.status(201).json({
            message: "Location created successfully",
            location
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create location",
            error: error.message
        });
    }
};

const getLocations = async (req, res) => {
    try {
        const locations = await Location.findAll({
            order: [["id", "ASC"]]
        });

        res.json(locations);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch locations",
            error: error.message
        });
    }
};

module.exports = {
    createLocation,
    getLocations
};