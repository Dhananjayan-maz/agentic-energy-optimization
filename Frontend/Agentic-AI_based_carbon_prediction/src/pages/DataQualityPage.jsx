
import { useEffect, useState } from "react";
import api from "../Services/api";
import PageHeader from "../components/layout/PageHeader";
import QualitySummary from "../components/data-quality/QualitySummary";
import RecentRejections from "../components/data-quality/RecentRejections";
import "./Dashboard-redesign.css";

function DataQualityPage() {
    const [qualityData, setQualityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadQualityData = async () => {
            try {
                const response = await api.get("/data-quality/");

                if (cancelled) return;

                setQualityData(response.data);
                setError("");
            } catch (requestError) {
                if (cancelled) return;

                console.error("Data quality error:", requestError);
                setError("Unable to retrieve data quality information.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadQualityData();

        // Refresh quality information every 30 seconds.
        const interval = setInterval(loadQualityData, 30000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="main-workspace data-quality-workspace">
            <PageHeader
                section="WORKSPACE"
                title="Data Quality"
                description="Monitor incoming IoT readings, validation checks, and rejected messages."
            />

            <QualitySummary
                data={qualityData}
                loading={loading}
                error={error}
            />

            {qualityData && (
                <RecentRejections
                    rejections={qualityData.recent_rejections || []}
                />
            )}

            <footer className="dashboard-footer">
                <span>EnergiQ · Data quality monitoring</span>
                <span>
                    Automatically refreshed every 30 seconds
                </span>
            </footer>
        </div>
    );
}

export default DataQualityPage;
