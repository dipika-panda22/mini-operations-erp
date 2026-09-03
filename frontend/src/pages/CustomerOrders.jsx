import { useEffect, useState } from "react";
import axios from "axios";

function CustomerOrders() {
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);

    const [form, setForm] = useState({
        itemId: "",
        locationId: "",
        quantity: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    const loadData = async () => {
        try {
            const [
                ordersResponse,
                itemsResponse,
                locationsResponse
            ] = await Promise.all([
                axios.get(
                    "http://localhost:5000/api/orders",
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

            setOrders(ordersResponse.data);
            setItems(itemsResponse.data);
            setLocations(locationsResponse.data);

        } catch (err) {
            console.error(err);
            setError("Failed to load order data");
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
                "http://localhost:5000/api/orders",
                {
                    itemId: Number(form.itemId),
                    locationId: Number(form.locationId),
                    quantity: Number(form.quantity)
                },
                { headers }
            );

            setMessage(
                "Customer order created and stock reserved!"
            );

            setForm({
                itemId: "",
                locationId: "",
                quantity: ""
            });

            loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create order"
            );
        }
    };

    const cancelOrder = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/orders/${id}/cancel`,
                {},
                { headers }
            );

            setMessage(
                "Order cancelled and reserved stock released."
            );

            setError("");

            loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to cancel order"
            );
        }
    };

    return (
        <div>

            <h2>Customer Orders</h2>

            <p>
                Create customer orders and reserve available stock.
            </p>

            <div style={styles.formCard}>

                <h3>Create Customer Order</h3>

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
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        min="1"
                        style={styles.input}
                        required
                    />

                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Create Order
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

            <h3>Customer Order List</h3>

            <table style={styles.table}>

                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Item</th>
                        <th>Location</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>

                    {orders.map((order) => (
                        <tr key={order.id}>

                            <td>
                                {order.id}
                            </td>

                            <td>
                                {order.Item?.name ||
                                    order.itemId}
                            </td>

                            <td>
                                {order.Location?.name ||
                                    order.locationId}
                            </td>

                            <td>
                                {order.quantity}
                            </td>

                            <td>
                                {order.status}
                            </td>

                            <td>

                                {order.status === "Reserved" && (
                                    <button
                                        onClick={() =>
                                            cancelOrder(
                                                order.id
                                            )
                                        }
                                        style={styles.cancelButton}
                                    >
                                        Cancel
                                    </button>
                                )}

                                {order.status !== "Reserved" && (
                                    <span>
                                        -
                                    </span>
                                )}

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
        minWidth: "190px"
    },

    button: {
        padding: "10px 18px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    cancelButton: {
        padding: "7px 12px",
        backgroundColor: "#dc2626",
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

export default CustomerOrders;