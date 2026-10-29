
import { useEffect, useState } from "react";
import api from "../Services/api";

import PageHeader from "../components/layout/PageHeader";
import HistoricalSummary from "../components/analytics/HistoricalSummary";
import EnergyChart from "../components/analytics/EnergyChart";
import SolarChart from "../components/analytics/SolarChart";

import "./Dashboard-redesign.css";
import "./HistoricalAnalyticsPage.css";

function HistoricalAnalyticsPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadHistory = async () => {
            try {
                const response = await api.get("/history/");

                if (cancelled) return;

                if (!Array.isArray(response.data)) {
                    throw new Error("Unexpected historical API response.");
                }

                setHistory(response.data);
                setError("");
            } catch (requestError) {
                if (cancelled) return;

                console.error("Historical analytics error:", requestError);
                setError(
                    "Unable to retrieve historical records. Please check the backend and try again."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleRefresh = async () => {
        setLoading(true);

        try {
            const response = await api.get("/history/");

            if (!Array.isArray(response.data)) {
                throw new Error("Unexpected historical API response.");
            }

            setHistory(response.data);
            setError("");
        } catch (requestError) {
            console.error("Historical refresh error:", requestError);
            setError(
                "Unable to refresh historical records. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-workspace historical-analytics-workspace">
            <PageHeader
                section="WORKSPACE"
                title="Historical Analytics"
                description="Explore historical energy consumption and solar generation patterns."
            />

            <div className="historical-analytics-actions">
                <span className="historical-analytics-source">
                    <span className="historical-source-dot" />
                    Historical dataset  
                </span>

                <button
                    type="button"
                    className="historical-refresh-button"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh data"}
                </button>
            </div>

            <HistoricalSummary
                history={history}
                loading={loading}
                error={error}
            />

            <section className="historical-charts-section">
                <div className="historical-charts-heading">
                    <p className="eyebrow">TREND ANALYSIS</p>
                    <h2>Energy and renewable generation</h2>
                    <p>
                        Compare recorded energy consumption with the solar
                        energy produced over the same historical period.
                    </p>
                </div>

                <div className="historical-charts-grid">
                    <EnergyChart
                        history={history}
                        loading={loading}
                        error={error}
                    />

                    <SolarChart
                        history={history}
                        loading={loading}
                        error={error}
                    />
                </div>
            </section>

            <footer className="dashboard-footer">
                <span>EnergiQ · Historical analytics</span>
                <span>
                    {loading
                        ? "Loading historical records"
                        : error
                          ? "Historical data unavailable"
                          : `${history.length.toLocaleString()} records received from the API`}
                </span>
            </footer>
        </div>
    );
}

export default HistoricalAnalyticsPage;
