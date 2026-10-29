import { useEffect, useState } from "react";
import api from "../Services/api";
import "./Dashboard-redesign.css";

import PageHeader from "../components/layout/PageHeader";
import EnergyFlow from "../components/overview/EnergyFlow";
import LiveForecast from "../components/overview/LiveForecast";

function Overview() {
    const [liveData, setLiveData] = useState(null);
    const [liveError, setLiveError] = useState("");

    const [liveForecast, setLiveForecast] = useState(null);
    const [forecastError, setForecastError] = useState("");

    const [lastLiveUpdated, setLastLiveUpdated] = useState(null);
    const [lastForecastUpdated, setLastForecastUpdated] = useState(null);

    // Fetch live IoT readings immediately and refresh every 15 seconds.
    useEffect(() => {
        let cancelled = false;

        const loadLiveData = async () => {
            try {
                const response = await api.get("/live/");

                if (cancelled) return;

                setLiveData(response.data);
                setLiveError("");
                setLastLiveUpdated(new Date());
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

    // Fetch live AI forecasts immediately and refresh every 30 seconds.
    useEffect(() => {
        let cancelled = false;

        const loadLiveForecast = async () => {
            try {
                const response = await api.get("/live-forecast/");

                if (cancelled) return;

                setLiveForecast(response.data);
                setForecastError("");
                setLastForecastUpdated(new Date());
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

    return (
        <div className="main-workspace overview-workspace" id="overview">
            <PageHeader
                section="WORKSPACE"
                title="Energy overview"
                description="Monitor live IoT energy readings and AI-powered forecasts in one place."
                updatedAt={
                    lastLiveUpdated
                        ? `Last reading: ${lastLiveUpdated.toLocaleTimeString()}`
                        : "Waiting for IoT readings"
                }
            />

            {/* Live monitoring and AI forecasting */}
            <section
                className="content-grid energy-layout"
                id="live-monitoring"
            >
                <EnergyFlow
                    liveData={liveData}
                    liveError={liveError}
                />

                <LiveForecast
                    forecastData={liveForecast}
                    forecastError={forecastError}
                />
            </section>

            {/* Live system update information */}
            <footer className="dashboard-footer">
                <span>EnergiQ · Smart energy monitoring</span>

                <span>
                    {lastForecastUpdated
                        ? `Forecast refreshed at ${lastForecastUpdated.toLocaleTimeString()}`
                        : "Waiting for live forecast"}
                </span>
            </footer>
        </div>
    );
}

export default Overview;