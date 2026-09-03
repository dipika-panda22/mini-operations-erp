const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventory = sequelize.define("Inventory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    locationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    batch: {
        type: DataTypes.STRING,
        allowNull: false
    },

    physicalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },

    reservedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }
});

module.exports = Inventory;