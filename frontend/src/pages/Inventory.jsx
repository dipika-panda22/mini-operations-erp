import { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);

    const [form, setForm] = useState({
        itemId: "",
        locationId: "",
        batch: "",
        physicalQuantity: "",
        reservedQuantity: "0"
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    const loadData = async () => {
        try {
            const [inventoryResponse, itemsResponse, locationsResponse] =
                await Promise.all([
                    axios.get(
                        "http://localhost:5000/api/inventory",
                        { headers }
                    ),
                    axios.get(
                        "http://localhost:5000/api/items",
                        { headers }
                    ),
                    axios.get(
                        "http://localhost:5000/api/locations",
                        { headers }
                    )
                ]);

            setInventory(inventoryResponse.data);
            setItems(itemsResponse.data);
            setLocations(locationsResponse.data);

        } catch (err) {
            console.error(err);
            setError("Failed to load inventory data");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            await axios.post(
                "http://localhost:5000/api/inventory",
                {
                    itemId: Number(form.itemId),
                    locationId: Number(form.locationId),
                    batch: form.batch,
                    physicalQuantity: Number(form.physicalQuantity),
                    reservedQuantity: Number(form.reservedQuantity)
                },
                { headers }
            );

            setMessage("Inventory added successfully!");

            setForm({
                itemId: "",
                locationId: "",
                batch: "",
                physicalQuantity: "",
                reservedQuantity: "0"
            });

            loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to add inventory"
            );
        }
    };

    return (
        <div>

            <h2>Inventory Management</h2>

            <p>
                Add and monitor inventory across locations.
            </p>

            <div style={styles.formCard}>

                <h3>Add Inventory</h3>

                <form onSubmit={handleSubmit}>

                    <select
                        name="itemId"
                        value={form.itemId}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    >
                        <option value="">
                            Select Item
                        </option>

                        {items.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name} ({item.category})
                            </option>
                        ))}
                    </select>

                    <select
                        name="locationId"
                        value={form.locationId}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    >
                        <option value="">
                            Select Location
                        </option>

                        {locations.map((location) => (
                            <option
                                key={location.id}
                                value={location.id}
                            >
                                {location.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="batch"
                        placeholder="Batch"
                        value={form.batch}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="number"
                        name="physicalQuantity"
                        placeholder="Physical Quantity"
                        value={form.physicalQuantity}
                        onChange={handleChange}
                        min="0"
                        style={styles.input}
                        required
                    />

                    <input
                        type="number"
                        name="reservedQuantity"
                        placeholder="Reserved Quantity"
                        value={form.reservedQuantity}
                        onChange={handleChange}
                        min="0"
                        style={styles.input}
                    />

                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Add Inventory
                    </button>

                </form>

                {message && (
                    <p style={styles.success}>
                        {message}
                    </p>
                )}

                {error && (
                    <p style={styles.error}>
                        {error}
                    </p>
                )}

            </div>

            <h3>Current Inventory</h3>

            <table style={styles.table}>

                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Batch</th>
                        <th>Physical</th>
                        <th>Reserved</th>
                        <th>Available</th>
                    </tr>
                </thead>

                <tbody>

                    {inventory.map((stock) => (
                        <tr key={stock.id}>

                            <td>
                                {stock.Item?.name || stock.itemId}
                            </td>

                            <td>
                                {stock.Item?.category || "-"}
                            </td>

                            <td>
                                {stock.Location?.name ||
                                    stock.locationId}
                            </td>

                            <td>
                                {stock.batch}
                            </td>

                            <td>
                                {stock.physicalQuantity}
                            </td>

                            <td>
                                {stock.reservedQuantity}
                            </td>

                            <td>
                                <strong>
                                    {stock.availableQuantity}
                                </strong>
                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}

const styles = {
    formCard: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        marginBottom: "30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    },

    input: {
        padding: "10px",
        marginRight: "10px",
        marginBottom: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        minWidth: "180px"
    },

    button: {
        padding: "10px 18px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    success: {
        color: "green"
    },

    error: {
        color: "red"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "white"
    }
};

export default Inventory;