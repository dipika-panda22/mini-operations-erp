import { useEffect, useState } from "react";
import axios from "axios";

function Transfers() {
    const [transfers, setTransfers] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);

    const [form, setForm] = useState({
        sourceLocationId: "",
        destinationLocationId: "",
        itemId: "",
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
                transfersResponse,
                itemsResponse,
                locationsResponse
            ] = await Promise.all([
                axios.get(
                    "http://localhost:5000/api/transfers",
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

            setTransfers(transfersResponse.data);
            setItems(itemsResponse.data);
            setLocations(locationsResponse.data);

        } catch (err) {
            console.error(err);
            setError("Failed to load transfer data");
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

        if (
            form.sourceLocationId ===
            form.destinationLocationId
        ) {
            setError(
                "Source and destination locations must be different"
            );
            return;
        }

        try {
            await axios.post(
                "http://localhost:5000/api/transfers",
                {
                    sourceLocationId:
                        Number(form.sourceLocationId),

                    destinationLocationId:
                        Number(form.destinationLocationId),

                    itemId: Number(form.itemId),

                    quantity: Number(form.quantity)
                },
                { headers }
            );

            setMessage(
                "Transfer created successfully!"
            );

            setForm({
                sourceLocationId: "",
                destinationLocationId: "",
                itemId: "",
                quantity: ""
            });

            loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create transfer"
            );
        }
    };

    const dispatchTransfer = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/transfers/${id}/dispatch`,
                {},
                { headers }
            );

            setMessage("Transfer dispatched successfully!");
            setError("");

            loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to dispatch transfer"
            );
        }
    };

    const receiveTransfer = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/transfers/${id}/receive`,
                {},
                { headers }
            );

            setMessage("Transfer received successfully!");
            setError("");

            loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to receive transfer"
            );
        }
    };

    return (
        <div>

            <h2>Internal Transfers</h2>

            <p>
                Transfer inventory between locations.
            </p>

            <div style={styles.formCard}>

                <h3>Create Transfer</h3>

                <form onSubmit={handleSubmit}>

                    <select
                        name="sourceLocationId"
                        value={form.sourceLocationId}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    >
                        <option value="">
                            Select Source Location
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

                    <select
                        name="destinationLocationId"
                        value={form.destinationLocationId}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    >
                        <option value="">
                            Select Destination Location
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
                                {item.name}
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
                        Create Transfer
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

            <h3>Transfer List</h3>

            <table style={styles.table}>

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Item</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>

                    {transfers.map((transfer) => (
                        <tr key={transfer.id}>

                            <td>
                                {transfer.id}
                            </td>

                            <td>
                                {transfer.Item?.name ||
                                    transfer.itemId}
                            </td>

                            <td>
                                {transfer.SourceLocation?.name ||
                                    transfer.sourceLocationId}
                            </td>

                            <td>
                                {transfer.DestinationLocation?.name ||
                                    transfer.destinationLocationId}
                            </td>

                            <td>
                                {transfer.quantity}
                            </td>

                            <td>
                                {transfer.status}
                            </td>

                            <td>

                                {transfer.status === "Requested" && (
                                    <button
                                        onClick={() =>
                                            dispatchTransfer(
                                                transfer.id
                                            )
                                        }
                                        style={styles.actionButton}
                                    >
                                        Dispatch
                                    </button>
                                )}

                                {transfer.status === "Dispatched" && (
                                    <button
                                        onClick={() =>
                                            receiveTransfer(
                                                transfer.id
                                            )
                                        }
                                        style={styles.receiveButton}
                                    >
                                        Receive
                                    </button>
                                )}

                                {transfer.status === "Received" && (
                                    <span>
                                        Completed
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

    actionButton: {
        padding: "7px 12px",
        backgroundColor: "#f59e0b",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    receiveButton: {
        padding: "7px 12px",
        backgroundColor: "#16a34a",
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

export default Transfers;