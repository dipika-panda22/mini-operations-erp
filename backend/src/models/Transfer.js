const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transfer = sequelize.define("Transfer", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    sourceLocationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    destinationLocationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },

    status: {
        type: DataTypes.ENUM(
            "Requested",
            "Dispatched",
            "Received"
        ),
        allowNull: false,
        defaultValue: "Requested"
    }
});

module.exports = Transfer;