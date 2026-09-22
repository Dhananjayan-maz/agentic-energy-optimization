function Dashboard() {
    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.href = "/login";
    };

    return (
        <div>
            <h1>Energy Monitoring Dashboard</h1>

            <p>Login successful.</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;