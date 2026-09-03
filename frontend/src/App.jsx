import { useState } from "react";
import axios from "axios";

import Inventory from "./pages/Inventory";
import WorkOrders from "./pages/WorkOrders";
import Transfers from "./pages/Transfers";
import CustomerOrders from "./pages/CustomerOrders";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const [currentPage, setCurrentPage] = useState("dashboard");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setUser(response.data.user);
            setMessage("");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setEmail("");
        setPassword("");
        setCurrentPage("dashboard");
    };

    // Login screen
    if (!user) {
        return (
            <div style={styles.container}>
                <div style={styles.loginCard}>
                    <h1>Mini Operations ERP</h1>

                    <p style={styles.subtitle}>
                        Login to your account
                    </p>

                    <form onSubmit={handleLogin}>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            style={styles.input}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            style={styles.input}
                            required
                        />

                        <button
                            type="submit"
                            style={styles.button}
                        >
                            Login
                        </button>

                    </form>

                    {message && (
                        <p style={styles.error}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    const isAdmin = user.role === "Admin";
    const isOperationsUser =
        user.role === "Operations User";
    const isSalesUser =
        user.role === "Sales User";

    const canAccessInventory =
        isAdmin || isOperationsUser;

    const canAccessWorkOrders =
        isAdmin || isOperationsUser;

    const canAccessTransfers =
        isAdmin || isOperationsUser;

    const canAccessOrders =
        isAdmin || isSalesUser;

    // Render selected page
    const renderPage = () => {

        if (currentPage === "inventory" && canAccessInventory) {
            return <Inventory />;
        }

        if (currentPage === "workOrders" && canAccessWorkOrders) {
            return <WorkOrders />;
        }

        if (currentPage === "transfers" && canAccessTransfers) {
            return <Transfers />;
        }

        if (currentPage === "orders" && canAccessOrders) {
            return <CustomerOrders />;
        }

        return (
            <div>
                <h2>Dashboard</h2>

                <p style={styles.dashboardText}>
                    Select a module below to manage operations.
                </p>

                <div style={styles.grid}>

                    {canAccessInventory && (
                        <div
                            style={styles.card}
                            onClick={() =>
                                setCurrentPage("inventory")
                            }
                        >
                            <h3>📦 Inventory</h3>
                            <p>
                                View and manage inventory stock.
                            </p>
                        </div>
                    )}

                    {canAccessWorkOrders && (
                        <div
                            style={styles.card}
                            onClick={() =>
                                setCurrentPage("workOrders")
                            }
                        >
                            <h3>🏭 Work Orders</h3>
                            <p>
                                Manage work orders and status.
                            </p>
                        </div>
                    )}

                    {canAccessTransfers && (
                        <div
                            style={styles.card}
                            onClick={() =>
                                setCurrentPage("transfers")
                            }
                        >
                            <h3>🚚 Internal Transfers</h3>
                            <p>
                                Manage stock transfers.
                            </p>
                        </div>
                    )}

                    {canAccessOrders && (
                        <div
                            style={styles.card}
                            onClick={() =>
                                setCurrentPage("orders")
                            }
                        >
                            <h3>🛒 Customer Orders</h3>
                            <p>
                                Create orders and reserve stock.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        );
    };

    return (
        <div style={styles.dashboard}>

            <header style={styles.header}>

                <div>
                    <h1>Mini Operations ERP</h1>

                    <p>
                        Welcome, {user.name}
                    </p>

                    <span style={styles.roleBadge}>
                        {user.role}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </button>

            </header>

            <nav style={styles.navbar}>

                <button
                    onClick={() =>
                        setCurrentPage("dashboard")
                    }
                    style={styles.navButton}
                >
                    🏠 Dashboard
                </button>

                {canAccessInventory && (
                    <button
                        onClick={() =>
                            setCurrentPage("inventory")
                        }
                        style={styles.navButton}
                    >
                        📦 Inventory
                    </button>
                )}

                {canAccessWorkOrders && (
                    <button
                        onClick={() =>
                            setCurrentPage("workOrders")
                        }
                        style={styles.navButton}
                    >
                        🏭 Work Orders
                    </button>
                )}

                {canAccessTransfers && (
                    <button
                        onClick={() =>
                            setCurrentPage("transfers")
                        }
                        style={styles.navButton}
                    >
                        🚚 Transfers
                    </button>
                )}

                {canAccessOrders && (
                    <button
                        onClick={() =>
                            setCurrentPage("orders")
                        }
                        style={styles.navButton}
                    >
                        🛒 Customer Orders
                    </button>
                )}

            </nav>

            <main style={styles.main}>
                {renderPage()}
            </main>

        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8"
    },

    loginCard: {
        width: "350px",
        padding: "35px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        textAlign: "center"
    },

    subtitle: {
        color: "#666",
        marginBottom: "25px"
    },

    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        boxSizing: "border-box"
    },

    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "16px"
    },

    error: {
        color: "red",
        marginTop: "15px"
    },

    dashboard: {
        minHeight: "100vh",
        backgroundColor: "#f4f6f8"
    },

    header: {
        backgroundColor: "white",
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },

    roleBadge: {
        display: "inline-block",
        marginTop: "5px",
        padding: "5px 10px",
        backgroundColor: "#e0e7ff",
        borderRadius: "15px",
        fontSize: "13px"
    },

    navbar: {
        backgroundColor: "#1e293b",
        padding: "10px 40px",
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
    },

    navButton: {
        padding: "10px 15px",
        backgroundColor: "transparent",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
    },

    main: {
        padding: "40px"
    },

    dashboardText: {
        color: "#666"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px"
    },

    card: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer"
    },

    logoutButton: {
        padding: "10px 18px",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    }
};

export default App;