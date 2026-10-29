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
import "./Dashboard-redesign.css";

function formatNumber(value, digits = 3) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "N/A";
}

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

    useEffect(() => {
        let cancelled = false;
        const loadDashboard = async () => {
            try {
                const [dashboardResponse, historyResponse] = await Promise.all([
                    api.get("/dashboard/"),
                    api.get("/history/"),
                ]);
                if (cancelled) return;
                setDashboard(dashboardResponse.data);
                setHistory(historyResponse.data.map((item) => ({
                    time: new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    energy: item.energy_consumption_kwh,
                    solar: item.solar_generation_kwh,
                })));
                setLastUpdated(new Date());
            } catch (error) {
                if (!cancelled) console.error("Dashboard error:", error);
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

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    if (loading && !dashboard) {
        return <div className="loading">Loading dashboard...</div>;
    }
    if (!dashboard) {
        return <div className="loading">Unable to load dashboard.</div>;
    }

    const deviceStatus = liveData?.status || "offline";
    const qualityStatus = qualityData?.status || "nodata";
    const energyForecastReady = liveForecast?.status === "ready";

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand-lockup">
                    <div className="brand-mark" aria-hidden="true">⚡</div>
                    <div>
                        <div className="brand-name">EnergiQ</div>
                        <div className="brand-caption">SMART ENERGY INTELLIGENCE</div>
                    </div>
                </div>

                <div className="sidebar-label">WORKSPACE</div>
                <nav className="sidebar-nav" aria-label="Dashboard sections">
                    <button className="nav-item active" onClick={() => scrollToSection("overview")}><span className="nav-icon">◫</span> Overview</button>
                    <button className="nav-item" onClick={() => scrollToSection("live-monitoring")}><span className="nav-icon">⌁</span> Live monitoring</button>
                    <button className="nav-item" onClick={() => scrollToSection("forecasts")}><span className="nav-icon">↗</span> AI forecasts</button>
                    <button className="nav-item" onClick={() => scrollToSection("analytics")}><span className="nav-icon">▥</span> Energy analytics</button>
                    <button className="nav-item" onClick={() => scrollToSection("data-quality")}><span className="nav-icon">✓</span> Data quality</button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-system-card">
                        <span className="system-pulse" />
                        <div><strong>Monitoring system</strong><span>{liveData ? "IoT feed connected" : "Waiting for IoT feed"}</span></div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout}><span className="nav-icon">↪</span> Log out</button>
                    <div className="sidebar-version">ENERGIQ · PROJECT DEMO</div>
                </div>
            </aside>

            <main className="main-workspace" id="overview">
                <header className="topbar">
                    <div className="breadcrumb">Workspace <span>/</span> Overview</div>
                    <div className="topbar-actions">
                        <div className="live-indicator"><span className="live-dot" />Live monitoring</div>
                        <div className="avatar" title="Energy dashboard">EQ</div>
                    </div>
                </header>

                <section className="page-heading">
                    <div>
                        <p className="eyebrow">ENERGY INTELLIGENCE PLATFORM</p>
                        <h1>Energy overview</h1>
                        <p className="page-subtitle">Monitor energy usage, solar generation, and AI-powered forecasts in one place.</p>
                    </div>
                    <div className="update-chip">
                        <span className="update-chip-dot" />
                        <div><strong>{lastUpdated ? "Data refreshed" : "Connecting"}</strong><span>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Fetching dashboard data"}</span></div>
                    </div>
                </section>

                <section className="metrics-grid" aria-label="Historical summary metrics">
                    <article className="metric-card metric-energy">
                        <div className="metric-topline"><span className="metric-icon">ϟ</span><span className="metric-tag">HISTORICAL</span></div>
                        <p className="metric-label">Latest energy consumption</p>
                        <div className="metric-value">{formatNumber(dashboard.latest.energy_consumption_kwh)} <span>kWh</span></div>
                        <p className="metric-footnote">From historical dataset</p>
                    </article>
                    <article className="metric-card metric-solar">
                        <div className="metric-topline"><span className="metric-icon">☼</span><span className="metric-tag">HISTORICAL</span></div>
                        <p className="metric-label">Latest solar generation</p>
                        <div className="metric-value">{formatNumber(dashboard.latest.solar_generation_kwh)} <span>kWh</span></div>
                        <p className="metric-footnote">From historical dataset</p>
                    </article>
                    <article className="metric-card metric-forecast">
                        <div className="metric-topline"><span className="metric-icon">↗</span><span className="metric-tag">AI PREDICTION</span></div>
                        <p className="metric-label">Energy forecast</p>
                        <div className="metric-value">{formatNumber(dashboard.forecast.energy_kwh)} <span>kWh</span></div>
                        <p className="metric-footnote">Historical model forecast</p>
                    </article>
                    <article className="metric-card metric-carbon">
                        <div className="metric-topline"><span className="metric-icon">✳</span><span className="metric-tag">AI PREDICTION</span></div>
                        <p className="metric-label">Solar forecast</p>
                        <div className="metric-value">{formatNumber(dashboard.forecast.solar_kwh)} <span>kWh</span></div>
                        <p className="metric-footnote">Historical model forecast</p>
                    </article>
                </section>

                <section className="content-grid energy-layout" id="live-monitoring">
                    <article className="panel energy-flow-panel">
                        <div className="panel-heading">
                            <div><p className="eyebrow">REAL-TIME SYSTEM</p><h2>Energy flow</h2><p className="panel-description">Current simulator readings at a glance</p></div>
                            <span className={`status-pill status-${deviceStatus}`}><span />{deviceStatus === "online" ? "Device online" : deviceStatus === "stale" ? "Reading stale" : "Device offline"}</span>
                        </div>
                        {liveError && <p className="inline-alert" role="alert">{liveError}</p>}
                        {!liveData && !liveError && <p className="empty-state">Waiting for the first IoT reading…</p>}
                        {liveData && <>
                            <div className="flow-visual" aria-label="Illustration of solar generation and energy consumption; connectors are conceptual, not measured grid flow">
                                <div className="flow-node solar-node">
                                    <div className="flow-node-icon">☼</div><span className="flow-node-label">SOLAR INPUT</span>
                                    <strong>{formatNumber(liveData.solar_generation_kwh)} <small>kWh</small></strong><span className="flow-node-caption">Simulated generation</span>
                                </div>
                                <div className="flow-connector"><span className="flow-connector-line" /><span className="flow-connector-arrow">›</span><span className="flow-connector-caption">Energy data</span></div>
                                <div className="flow-core"><div className="flow-core-icon">⚡</div><strong>Smart energy</strong><span>Monitoring hub</span></div>
                                <div className="flow-connector"><span className="flow-connector-line" /><span className="flow-connector-arrow">›</span><span className="flow-connector-caption">Usage data</span></div>
                                <div className="flow-node usage-node">
                                    <div className="flow-node-icon">ϟ</div><span className="flow-node-label">ENERGY USE</span>
                                    <strong>{formatNumber(liveData.energy_consumption_kwh)} <small>kWh</small></strong><span className="flow-node-caption">Simulated consumption</span>
                                </div>
                            </div>
                            <p className="flow-disclaimer">Conceptual visualization of reported readings. It does not represent measured grid import or a verified energy balance.</p>
                            <div className="live-details-grid">
                                <div className="live-detail"><span>Temperature</span><strong>{formatNumber(liveData.temperature, 1)} <small>°C</small></strong></div>
                                <div className="live-detail"><span>Humidity</span><strong>{formatNumber(liveData.humidity, 1)} <small>%</small></strong></div>
                                <div className="live-detail"><span>Solar irradiance</span><strong>{formatNumber(liveData.irradiance, 1)} <small>W/m²</small></strong></div>
                            </div>
                            <div className="reading-meta">
                                <span>Device <strong>{liveData.device_id}</strong></span>
                                <span>Reading age <strong>{liveData.age_seconds ?? "N/A"}s</strong></span>
                                <span>Updated <strong>{liveData.timestamp ? new Date(liveData.timestamp).toLocaleTimeString() : "N/A"}</strong></span>
                            </div>
                        </>}
                    </article>

                    <article className="panel forecast-panel" id="forecasts">
                        <div className="panel-heading">
                            <div><p className="eyebrow">PREDICTIVE INTELLIGENCE</p><h2>Live AI forecast</h2><p className="panel-description">Model estimates using available interval context</p></div>
                            <span className="ai-mark">AI</span>
                        </div>
                        {forecastError && <p className="inline-alert" role="alert">{forecastError}</p>}
                        {!liveForecast && !forecastError && <p className="empty-state">Loading live forecasts…</p>}
                        {liveForecast && <>
                            <div className="forecast-status-row">
                                <span className={`status-pill ${energyForecastReady ? "status-online" : "status-stale"}`}><span />{energyForecastReady ? "Forecast ready" : "Preparing forecast"}</span>
                                <span className="forecast-source">{liveForecast.source || "Source unavailable"}</span>
                            </div>
                            {energyForecastReady ? <div className="forecast-values">
                                <div className="forecast-value-card"><span className="forecast-value-icon">ϟ</span><span className="forecast-value-label">Predicted consumption</span><strong>{formatNumber(liveForecast.energy_forecast)} <small>kWh</small></strong></div>
                                <div className="forecast-value-card"><span className="forecast-value-icon">☼</span><span className="forecast-value-label">Predicted solar</span><strong>{formatNumber(liveForecast.solar_forecast)} <small>kWh</small></strong></div>
                            </div> : <p className="empty-state">{liveForecast.message || "The live forecast is warming up."}</p>}
                            {liveForecast.live_intervals_used != null && <div className="interval-note"><span className="interval-note-icon">◷</span><span>Completed live intervals used</span><strong>{liveForecast.live_intervals_used}</strong></div>}
                            {liveForecast.message && energyForecastReady && <p className="forecast-message">{liveForecast.message}</p>}
                            <p className="forecast-disclaimer">Predictions are model estimates, not guaranteed future measurements.</p>
                        </>}
                    </article>
                </section>

                <section className="panel quality-panel" id="data-quality">
                    <div className="panel-heading">
                        <div><p className="eyebrow">PIPELINE HEALTH</p><h2>Data quality monitoring</h2><p className="panel-description">Incoming simulator readings and MQTT message validation</p></div>
                        <span className={`status-pill ${qualityStatus === "healthy" ? "status-online" : qualityStatus === "warning" ? "status-stale" : "status-offline"}`}><span />{qualityStatus === "healthy" ? "Healthy" : qualityStatus === "warning" ? "Warning" : "No data"}</span>
                    </div>
                    {qualityError && <p className="inline-alert" role="alert">{qualityError}</p>}
                    {!qualityData && !qualityError && <p className="empty-state">Loading data-quality status…</p>}
                    {qualityData && <>
                        <div className="quality-stats-grid">
                            <div className="quality-stat"><span>Saved simulator readings</span><strong>{qualityData.total_readings ?? "N/A"}</strong></div>
                            <div className="quality-stat"><span>Rejected messages</span><strong>{qualityData.rejected_messages ?? "N/A"}</strong></div>
                            <div className="quality-stat"><span>Duplicate messages</span><strong>{qualityData.duplicate_messages ?? "N/A"}</strong></div>
                            <div className="quality-stat"><span>Latest reading age</span><strong>{qualityData.age_seconds != null ? `${qualityData.age_seconds}s` : "N/A"}</strong></div>
                        </div>
                        <div className="quality-lower-grid">
                            <div>
                                <h3>Validation checks</h3>
                                <div className="quality-check-list">
                                    <div><span>Data availability</span><strong>{qualityData.checks?.data_available ? "Available" : "No data"}</strong></div>
                                    <div><span>Freshness</span><strong>{qualityData.checks?.freshness ?? "N/A"}</strong></div>
                                    <div><span>Numeric values</span><strong>{qualityData.checks?.numeric_values ?? "N/A"}</strong></div>
                                    <div><span>Value ranges</span><strong>{qualityData.checks?.value_ranges ?? "N/A"}</strong></div>
                                </div>
                            </div>
                            <div>
                                <h3>Recent rejections</h3>
                                {!qualityData.recent_rejections?.length ? <p className="no-rejections">No rejected messages recorded.</p> : <ul className="rejection-list">
                                    {qualityData.recent_rejections.map((event, index) => <li key={`${event.received_at}-${index}`}>
                                        <strong>{event.reason}</strong><span>Device: {event.device_id || "Unknown"}</span><span>{event.received_at ? new Date(event.received_at).toLocaleString() : "Time unavailable"}</span>
                                    </li>)}
                                </ul>}
                            </div>
                        </div>
                    </>}
                </section>

                <section className="analytics-section" id="analytics">
                    <div className="section-title-row">
                        <div><p className="eyebrow">HISTORICAL PERFORMANCE</p><h2>Energy analytics</h2><p className="panel-description">Trends from the historical dataset</p></div>
                        <span className="history-label">Historical data</span>
                    </div>
                    <div className="historical-metrics-grid">
                        <div className="historical-metric"><span>Latest energy use</span><strong>{formatNumber(dashboard.latest.energy_consumption_kwh)} <small>kWh</small></strong></div>
                        <div className="historical-metric"><span>Latest solar output</span><strong>{formatNumber(dashboard.latest.solar_generation_kwh)} <small>kWh</small></strong></div>
                        <div className="historical-metric"><span>Energy model estimate</span><strong>{formatNumber(dashboard.forecast.energy_kwh)} <small>kWh</small></strong></div>
                        <div className="historical-metric"><span>Solar model estimate</span><strong>{formatNumber(dashboard.forecast.solar_kwh)} <small>kWh</small></strong></div>
                    </div>
                    <div className="charts-grid">
                        <article className="panel chart-panel">
                            <div className="panel-heading"><div><h2>Energy consumption</h2><p className="panel-description">Historical readings over time</p></div><span className="chart-legend-dot energy-dot" /></div>
                            <div className="chart-container"><ResponsiveContainer width="100%" height={300}>
                                <LineChart data={history} margin={{ top: 10, right: 8, left: -12, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4" />
                                    <XAxis dataKey="time" tick={{ fill: "#7c8799", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
                                    <YAxis tick={{ fill: "#7c8799", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5eaf1", boxShadow: "0 8px 24px rgba(20,35,60,.08)" }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="energy" name="Energy consumption" stroke="#4776e6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer></div>
                        </article>
                        <article className="panel chart-panel">
                            <div className="panel-heading"><div><h2>Solar generation</h2><p className="panel-description">Historical renewable output over time</p></div><span className="chart-legend-dot solar-dot" /></div>
                            <div className="chart-container"><ResponsiveContainer width="100%" height={300}>
                                <LineChart data={history} margin={{ top: 10, right: 8, left: -12, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4" />
                                    <XAxis dataKey="time" tick={{ fill: "#7c8799", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
                                    <YAxis tick={{ fill: "#7c8799", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5eaf1", boxShadow: "0 8px 24px rgba(20,35,60,.08)" }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="solar" name="Solar generation" stroke="#e9a23b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer></div>
                        </article>
                    </div>
                </section>

                <footer className="dashboard-footer">
                    <span>EnergiQ · Smart energy monitoring</span>
                    <span>{lastUpdated ? `Historical data refreshed at ${lastUpdated.toLocaleTimeString()}` : "Waiting for historical data"}</span>
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;
