const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CustomerOrder = sequelize.define("CustomerOrder", {
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

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },

    status: {
        type: DataTypes.ENUM(
            "Reserved",
            "Cancelled",
            "Completed"
        ),
        allowNull: false,
        defaultValue: "Reserved"
    }
});

module.exports = CustomerOrder;