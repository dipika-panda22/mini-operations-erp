const User = require("./User");
const Location = require("./Location");
const Item = require("./Item");
const Inventory = require("./Inventory");
const WorkOrder = require("./WorkOrder");
const Transfer = require("./Transfer");
const CustomerOrder = require("./CustomerOrder");

// Inventory relationships
Inventory.belongsTo(Item, { foreignKey: "itemId" });
Inventory.belongsTo(Location, { foreignKey: "locationId" });

// Work Order relationships
WorkOrder.belongsTo(Item, { foreignKey: "itemId" });
WorkOrder.belongsTo(Location, { foreignKey: "locationId" });
WorkOrder.belongsTo(User, { foreignKey: "assignedUserId" });

// Transfer relationships
Transfer.belongsTo(Item, { foreignKey: "itemId" });
Transfer.belongsTo(Location, {
    foreignKey: "sourceLocationId",
    as: "SourceLocation"
});
Transfer.belongsTo(Location, {
    foreignKey: "destinationLocationId",
    as: "DestinationLocation"
});

// Customer Order relationships
CustomerOrder.belongsTo(Item, { foreignKey: "itemId" });
CustomerOrder.belongsTo(Location, { foreignKey: "locationId" });

module.exports = {
    User,
    Location,
    Item,
    Inventory,
    WorkOrder,
    Transfer,
    CustomerOrder
};
