import { useEffect, useState } from "react";
import axios from "axios";

function WorkOrders() {
    const [workOrders, setWorkOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);

    const [form, setForm] = useState({
        locationId: "",
        itemId: "",
        requiredQuantity: "",
        assignedUserId: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    // Load Work Orders, Items, Locations and Users
    const loadData = async () => {
        try {
            const [
                workOrderResponse,
                itemsResponse,
                locationsResponse,
                usersResponse
            ] = await Promise.all([
                axios.get(
                    "http://localhost:5000/api/work-orders",
                    { headers }
                ),

                axios.get(
                    "http://localhost:5000/api/items",
                    { headers }
                ),

                axios.get(
                    "http://localhost:5000/api/locations",
                    { headers }
                ),

                axios.get(
                    "http://localhost:5000/api/users",
                    { headers }
                )
            ]);

            setWorkOrders(workOrderResponse.data);
            setItems(itemsResponse.data);
            setLocations(locationsResponse.data);
            setUsers(usersResponse.data);

        } catch (err) {
            console.error(err);

        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle form changes
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Create Work Order
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const quantity = Number(form.requiredQuantity);
        const assignedUser = Number(form.assignedUserId);

        if (!form.locationId) {
            setError("Please select a location.");
            return;
        }

        if (!form.itemId) {
            setError("Please select an item.");
            return;
        }

        if (quantity < 1) {
            setError("Required quantity must be at least 1.");
            return;
        }

        if (!form.assignedUserId || assignedUser < 1) {
            setError("Please select an assigned user.");
            return;
        }

        try {
            await axios.post(
                "http://localhost:5000/api/work-orders",
                {
                    locationId: Number(form.locationId),
                    itemId: Number(form.itemId),
                    requiredQuantity: quantity,
                    assignedUserId: assignedUser
                },
                { headers }
            );

            setMessage("Work Order created successfully!");

            setForm({
                locationId: "",
                itemId: "",
                requiredQuantity: "",
                assignedUserId: ""
            });

            await loadData();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to create Work Order"
            );
        }
    };

    // Update Work Order status
    const updateStatus = async (id, status) => {
        try {
            setMessage("");
            setError("");

            await axios.put(
                `http://localhost:5000/api/work-orders/${id}/status`,
                { status },
                { headers }
            );

            setMessage(
                `Work Order ${status.toLowerCase()} successfully!`
            );

            await loadData();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update Work Order"
            );
        }
    };

    return (
        <div>

            <h2>Work Order Management</h2>

            <p>
                Create and manage production work orders.
            </p>

            {/* CREATE WORK ORDER */}
            <div style={styles.formCard}>

                <h3>Create Work Order</h3>

                <form onSubmit={handleSubmit}>

                    {/* LOCATION */}
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

                    {/* ITEM */}
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

                    {/* REQUIRED QUANTITY */}
                    <input
                        type="number"
                        name="requiredQuantity"
                        placeholder="Required Quantity"
                        value={form.requiredQuantity}
                        onChange={handleChange}
                        min="1"
                        style={styles.input}
                        required
                    />

                    {/* ASSIGNED USER */}
                    <select
                        name="assignedUserId"
                        value={form.assignedUserId}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    >
                        <option value="">
                            Select Assigned User
                        </option>

                        {users.map((user) => (
                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {user.name} - {user.role}
                            </option>
                        ))}
                    </select>

                    {/* CREATE BUTTON */}
                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Create Work Order
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

            {/* WORK ORDER LIST */}
            <h3>Work Order List</h3>

            <table style={styles.table}>

                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Item</th>
                        <th style={styles.th}>Location</th>
                        <th style={styles.th}>Required Qty</th>
                        <th style={styles.th}>Assigned User</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Shortage</th>
                        <th style={styles.th}>Action</th>
                    </tr>
                </thead>

                <tbody>

                    {workOrders.length === 0 ? (

                        <tr>
                            <td
                                colSpan="8"
                                style={styles.empty}
                            >
                                No Work Orders found.
                            </td>
                        </tr>

                    ) : (

                        workOrders.map((order) => (

                            <tr key={order.id}>

                                {/* ID */}
                                <td style={styles.td}>
                                    {order.id}
                                </td>

                                {/* ITEM */}
                                <td style={styles.td}>
                                    {order.Item?.name ||
                                        order.itemId}
                                </td>

                                {/* LOCATION */}
                                <td style={styles.td}>
                                    {order.Location?.name ||
                                        order.locationId}
                                </td>

                                {/* REQUIRED QUANTITY */}
                                <td style={styles.td}>
                                    {order.requiredQuantity}
                                </td>

                                {/* ASSIGNED USER */}
                                <td style={styles.td}>
                                    {order.User?.name ||
                                        order.assignedUserId}
                                </td>

                                {/* STATUS */}
                                <td style={styles.td}>
                                    <span
                                        style={getStatusStyle(
                                            order.status
                                        )}
                                    >
                                        {order.status}
                                    </span>
                                </td>

                                {/* SHORTAGE */}
                                <td style={styles.td}>
                                    {order.shortage !== undefined
                                        ? order.shortage
                                        : "-"}
                                </td>

                                {/* ACTION */}
                                <td style={styles.td}>

                                    {order.status === "Assigned" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    order.id,
                                                    "In Progress"
                                                )
                                            }
                                            style={styles.startButton}
                                        >
                                            Start
                                        </button>
                                    )}

                                    {order.status === "In Progress" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    order.id,
                                                    "Completed"
                                                )
                                            }
                                            style={styles.completeButton}
                                        >
                                            Complete
                                        </button>
                                    )}

                                    {order.status === "Completed" && (
                                        <span style={styles.finished}>
                                            ✓ Finished
                                        </span>
                                    )}

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>
    );
}

// Status styling
const getStatusStyle = (status) => {

    if (status === "Completed") {
        return {
            fontWeight: "bold",
            color: "green"
        };
    }

    if (status === "In Progress") {
        return {
            fontWeight: "bold",
            color: "#f59e0b"
        };
    }

    return {
        fontWeight: "bold",
        color: "#2563eb"
    };
};

// Page styling
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

    startButton: {
        padding: "7px 12px",
        backgroundColor: "#f59e0b",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginRight: "5px"
    },

    completeButton: {
        padding: "7px 12px",
        backgroundColor: "#16a34a",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    success: {
        color: "green",
        fontWeight: "bold"
    },

    error: {
        color: "red",
        fontWeight: "bold"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "white"
    },

    th: {
        padding: "12px",
        borderBottom: "2px solid #ddd",
        textAlign: "left"
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #eee"
    },

    empty: {
        textAlign: "center",
        padding: "20px",
        color: "#666"
    },

    finished: {
        fontWeight: "bold",
        color: "green"
    }
};

export default WorkOrders;