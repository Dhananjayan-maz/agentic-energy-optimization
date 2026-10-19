
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import api from "../Services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [history, setHistory] = useState([]);
    const [liveData, setLiveData] = useState(null);
    const [liveError, setLiveError] = useState("");
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Historical dashboard and forecast: refresh every 30 seconds
    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                const [dashboardResponse, historyResponse] =
                    await Promise.all([
                        api.get("/dashboard/"),
                        api.get("/history/"),
                    ]);

                if (cancelled) return;

                setDashboard(dashboardResponse.data);

                const formattedHistory = historyResponse.data.map((item) => ({
                    time: new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    energy: item.energy_consumption_kwh,
                    solar: item.solar_generation_kwh,
                }));

                setHistory(formattedHistory);
                setLastUpdated(new Date());
            } catch (error) {
                if (!cancelled) {
                    console.error("Dashboard error:", error);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadDashboard();
        const interval = setInterval(loadDashboard, 30000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    // Live IoT monitoring: refresh every 15 seconds
    useEffect(() => {
        let cancelled = false;

        const loadLiveData = async () => {
            try {
                const response = await api.get("/live/");

                if (cancelled) return;

                setLiveData(response.data);
                setLiveError("");
            } catch (error) {
                if (cancelled) return;

                console.error("Live monitoring error:", error);
                setLiveError("Unable to retrieve live IoT readings.");
            }
        };

        loadLiveData();
        const interval = setInterval(loadLiveData, 15000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
    };

    if (loading && !dashboard) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (!dashboard) {
        return <div className="loading">Unable to load dashboard.</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Energy Monitoring Dashboard</h1>
                    <p>AI-powered energy and renewable energy monitoring</p>
                </div>

                <div className="header-actions">
                    <div className="live-indicator">
                        <span className="live-dot"></span>
                        Live Monitoring
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Live IoT readings */}
            <div className="chart-card">
                <h2>Live IoT Monitoring</h2>
                <p>
                    Simulator data — these readings are generated, not from
                    physical sensors.
                </p>

                {liveError && (
                    <p role="alert">{liveError}</p>
                )}

                {!liveData && !liveError && (
                    <p>Waiting for IoT readings...</p>
                )}

                {liveData && (
                    <>
                        <p>
                            Device: <strong>{liveData.device_id}</strong>
                        </p>
                        <p>
                            Last reading:{" "}
                            {new Date(liveData.timestamp).toLocaleString()}
                        </p>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h3>Live Energy Consumption</h3>
                                <p className="value">
                                    {Number(
                                        liveData.energy_consumption_kwh
                                    ).toFixed(3)}
                                </p>
                                <p className="unit">kWh</p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Live Solar Generation</h3>
                                <p className="value">
                                    {Number(
                                        liveData.solar_generation_kwh
                                    ).toFixed(3)}
                                </p>
                                <p className="unit">kWh</p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Temperature</h3>
                                <p className="value">
                                    {Number(liveData.temperature).toFixed(1)}
                                </p>
                                <p className="unit">°C (simulated)</p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Humidity</h3>
                                <p className="value">
                                    {Number(liveData.humidity).toFixed(1)}
                                </p>
                                <p className="unit">% (simulated)</p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Solar Irradiance</h3>
                                <p className="value">
                                    {Number(liveData.irradiance).toFixed(1)}
                                </p>
                                <p className="unit">W/m² (simulated)</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Existing forecast and historical summary */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Historical Energy Consumption</h3>
                    <p className="value">
                        {Number(
                            dashboard.latest.energy_consumption_kwh
                        ).toFixed(3)}
                    </p>
                    <p className="unit">kWh</p>
                </div>

                <div className="dashboard-card">
                    <h3>Historical Solar Generation</h3>
                    <p className="value">
                        {Number(
                            dashboard.latest.solar_generation_kwh
                        ).toFixed(3)}
                    </p>
                    <p className="unit">kWh</p>
                </div>

                <div className="dashboard-card">
                    <h3>Energy Forecast</h3>
                    <p className="value">
                        {Number(dashboard.forecast.energy_kwh).toFixed(3)}
                    </p>
                    <p className="unit">Predicted kWh</p>
                </div>

                <div className="dashboard-card">
                    <h3>Solar Forecast</h3>
                    <p className="value">
                        {Number(dashboard.forecast.solar_kwh).toFixed(3)}
                    </p>
                    <p className="unit">Predicted kWh</p>
                </div>
            </div>

            <div className="chart-card">
                <h2>Historical Energy Consumption</h2>

                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="energy"
                            name="Energy Consumption"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <h2>Historical Solar Generation</h2>

                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="solar"
                            name="Solar Generation"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {lastUpdated && (
                <p className="timestamp">
                    Historical dashboard updated:{" "}
                    {lastUpdated.toLocaleTimeString()}
                </p>
            )}
        </div>
    );
}

export default Dashboard;
