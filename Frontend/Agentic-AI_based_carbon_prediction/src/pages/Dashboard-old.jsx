
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
    const [liveForecast, setLiveForecast] = useState(null);
    const [forecastError, setForecastError] = useState("");
    const [qualityData, setQualityData] = useState(null);
    const [qualityError, setQualityError] = useState("");
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



    // Live forecasting: refresh every 30 seconds
    useEffect(() => {
        let cancelled = false;

        const loadLiveForecast = async () => {
            try {
                const response = await api.get("/live-forecast/");

                if (cancelled) return;

                setLiveForecast(response.data);
                setForecastError("");
            } catch (error) {
                if (cancelled) return;

                console.error("Live forecast error:", error);
                setForecastError("Unable to retrieve live forecasts.");
            }
        };

        loadLiveForecast();
        const interval = setInterval(loadLiveForecast, 30000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);


    // Data quality monitoring: refresh every 15 seconds
    useEffect(() => {
        let cancelled = false;

        const loadQualityData = async () => {
            try {
                const response = await api.get("/data-quality/");

                if (cancelled) return;

                setQualityData(response.data);
                setQualityError("");
            } catch (error) {
                if (cancelled) return;

                console.error("Data quality error:", error);
                setQualityError("Unable to retrieve data-quality status.");
            }
        };

        loadQualityData();
        const interval = setInterval(loadQualityData, 15000);

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

                        <div className="device-status-row">
                            <p>
                                Device: <strong>{liveData.device_id}</strong>
                            </p>

                            <span
                                className={`device-status device-status-${liveData.status}`}
                                role="status"
                            >
                                {liveData.status === "online"
                                    ? "● Online"
                                    : liveData.status === "stale"
                                        ? "● Stale"
                                        : "● Offline"}
                            </span>
                        </div>

                        <p>
                            Last reading:{" "}
                            {new Date(liveData.timestamp).toLocaleString()}
                        </p>

                        <p>
                            Reading age: {liveData.age_seconds} seconds
                            {" · "}
                            Stale threshold: {liveData.freshness_threshold_seconds} seconds
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


            {/* Data quality monitoring */}
            <div className="chart-card">
                <h2>Data Quality Monitoring</h2>
                <p>
                    Monitoring incoming simulator readings and rejected MQTT messages.
                </p>

                {qualityError && (
                    <p role="alert">{qualityError}</p>
                )}

                {!qualityData && !qualityError && (
                    <p>Loading data-quality status...</p>
                )}

                {qualityData && (
                    <>
                        <div className="device-status-row">
                            <p>
                                Overall status:{" "}
                                <strong>
                                    {qualityData.status === "healthy"
                                        ? "Healthy"
                                        : qualityData.status === "warning"
                                            ? "Warning"
                                            : "No Data"}
                                </strong>
                            </p>

                            <span
                                className={`device-status ${qualityData.status === "healthy"
                                    ? "device-status-online"
                                    : "device-status-stale"
                                    }`}
                                role="status"
                            >
                                {qualityData.status === "healthy"
                                    ? "● Healthy"
                                    : qualityData.status === "warning"
                                        ? "● Warning"
                                        : "● No Data"}
                            </span>
                        </div>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h3>Saved Simulator Readings</h3>
                                <p className="value">
                                    {qualityData.total_readings}
                                </p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Rejected Messages</h3>
                                <p className="value">
                                    {qualityData.rejected_messages}
                                </p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Duplicate Messages</h3>
                                <p className="value">
                                    {qualityData.duplicate_messages}
                                </p>
                            </div>

                            <div className="dashboard-card">
                                <h3>Latest Reading Age</h3>
                                <p className="value">
                                    {qualityData.age_seconds != null
                                        ? `${qualityData.age_seconds}s`
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        <h3>Quality Checks</h3>
                        <p>
                            Data availability:{" "}
                            <strong>
                                {qualityData.checks.data_available
                                    ? "Available"
                                    : "No data"}
                            </strong>
                        </p>
                        <p>
                            Freshness:{" "}
                            <strong>{qualityData.checks.freshness}</strong>
                        </p>
                        <p>
                            Numeric values:{" "}
                            <strong>{qualityData.checks.numeric_values}</strong>
                        </p>
                        <p>
                            Value ranges:{" "}
                            <strong>{qualityData.checks.value_ranges}</strong>
                        </p>

                        <h3>Recent Rejections</h3>

                        {qualityData.recent_rejections.length === 0 ? (
                            <p>No rejected messages recorded.</p>
                        ) : (
                            <ul>
                                {qualityData.recent_rejections.map(
                                    (event, index) => (
                                        <li
                                            key={`${event.received_at}-${index}`}
                                        >
                                            <strong>{event.reason}</strong>
                                            <br />
                                            Device: {event.device_id || "Unknown"}
                                            <br />
                                            {new Date(
                                                event.received_at
                                            ).toLocaleString()}
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                    </>
                )}
            </div>


            {/* Live AI Forecast */}
            <div className="chart-card">
                <h2>Live AI Forecast</h2>
                <p>
                    Forecasts use historical context and recent simulator intervals
                    when available.
                </p>

                {forecastError && (
                    <p role="alert">{forecastError}</p>
                )}

                {!liveForecast && !forecastError && (
                    <p>Loading live forecasts...</p>
                )}

                {liveForecast && (
                    <>
                        <p>
                            Forecast source:{" "}
                            <strong>{liveForecast.source || "Not available"}</strong>
                        </p>

                        {liveForecast.status === "ready" ? (
                            <div className="dashboard-grid">
                                <div className="dashboard-card">
                                    <h3>Live Energy Forecast</h3>
                                    <p className="value">
                                        {Number.isFinite(
                                            Number(liveForecast.energy_forecast)
                                        )
                                            ? Number(
                                                liveForecast.energy_forecast
                                            ).toFixed(3)
                                            : "N/A"}
                                    </p>
                                    <p className="unit">Predicted kWh</p>
                                </div>

                                <div className="dashboard-card">
                                    <h3>Live Solar Forecast</h3>
                                    <p className="value">
                                        {Number.isFinite(
                                            Number(liveForecast.solar_forecast)
                                        )
                                            ? Number(
                                                liveForecast.solar_forecast
                                            ).toFixed(3)
                                            : "N/A"}
                                    </p>
                                    <p className="unit">Predicted kWh</p>
                                </div>
                            </div>
                        ) : (
                            <p>
                                {liveForecast.message ||
                                    "The live forecast is warming up."}
                            </p>
                        )}

                        {liveForecast.live_intervals_used != null && (
                            <p>
                                Completed live intervals used:{" "}
                                {liveForecast.live_intervals_used}
                            </p>
                        )}

                        {liveForecast.message && (
                            <p>{liveForecast.message}</p>
                        )}
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
