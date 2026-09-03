const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkOrder = sequelize.define("WorkOrder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    locationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    requiredQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },

    assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM(
            "Assigned",
            "In Progress",
            "Completed"
        ),
        allowNull: false,
        defaultValue: "Assigned"
    }
});

module.exports = WorkOrder;