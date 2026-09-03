const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const inventoryRoutes = require("./routes/inventoryRoutes");
require("dotenv").config();
require("./models");

const app = express();
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const itemRoutes = require("./routes/itemRoutes");
const testRoutes = require("./routes/testRoutes");
const workOrderRoutes = require("./routes/workOrderRoutes");
const transferRoutes = require("./routes/transferRoutes");
const customerOrderRoutes = require("./routes/customerOrderRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/test", testRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/orders", customerOrderRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "Mini Operations ERP API is running!"
    });
});

const PORT = process.env.PORT || 5000;

sequelize.sync()
    .then(() => {
        console.log("Database tables created successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database setup failed:");
        console.error(error.message);
    });