
import "./HistoricalSummary.css";

function formatDate(timestamp) {
    if (!timestamp) return "—";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function HistoricalSummary({ history = [], loading = false, error = "" }) {
    const records = Array.isArray(history) ? history : [];

    const validRecords = records.filter(
        (item) =>
            Number.isFinite(Number(item.energy_consumption_kwh)) &&
            Number.isFinite(Number(item.solar_generation_kwh))
    );

    const energyValues = validRecords.map((item) =>
        Number(item.energy_consumption_kwh)
    );

    const solarValues = validRecords.map((item) =>
        Number(item.solar_generation_kwh)
    );

    const averageEnergy = energyValues.length
        ? energyValues.reduce((sum, value) => sum + value, 0) /
          energyValues.length
        : null;

    const peakEnergy = energyValues.length
        ? Math.max(...energyValues)
        : null;

    const averageSolar = solarValues.length
        ? solarValues.reduce((sum, value) => sum + value, 0) /
          solarValues.length
        : null;

    const sortedRecords = [...validRecords].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const firstTimestamp = sortedRecords[0]?.timestamp;
    const lastTimestamp = sortedRecords[sortedRecords.length - 1]?.timestamp;

    const metrics = [
        {
            label: "Historical records",
            value: validRecords.length.toLocaleString(),
            detail: "Valid readings returned by the API",
            icon: "database",
        },
        {
            label: "Average consumption",
            value: averageEnergy === null
                ? "—"
                : `${averageEnergy.toFixed(2)} kWh`,
            detail: "Average per recorded interval",
            icon: "activity",
        },
        {
            label: "Peak consumption",
            value: peakEnergy === null
                ? "—"
                : `${peakEnergy.toFixed(2)} kWh`,
            detail: "Highest recorded interval",
            icon: "zap",
        },
        {
            label: "Average solar generation",
            value: averageSolar === null
                ? "—"
                : `${averageSolar.toFixed(3)} kWh`,
            detail: "Average per recorded interval",
            icon: "sun",
        },
    ];

    if (loading) {
        return (
            <section className="panel historical-summary-panel">
                <p className="eyebrow">HISTORICAL DATASET</p>
                <h2>Historical summary</h2>
                <p className="historical-summary-message">
                    Loading historical records...
                </p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="panel historical-summary-panel">
                <p className="eyebrow">HISTORICAL DATASET</p>
                <h2>Historical summary</h2>
                <p className="historical-summary-error">{error}</p>
            </section>
        );
    }

    return (
        <section className="historical-summary-section">
            <div className="historical-summary-heading">
                <div>
                    <p className="eyebrow">HISTORICAL DATASET</p>
                    <h2>Historical summary</h2>
                    <p>
                        Statistics calculated from the historical records
                        currently returned by the backend.
                    </p>
                </div>

                <span className="historical-summary-period">
                    {firstTimestamp && lastTimestamp
                        ? `${formatDate(firstTimestamp)} – ${formatDate(lastTimestamp)}`
                        : "No date range available"}
                </span>
            </div>

            {validRecords.length === 0 ? (
                <div className="panel historical-summary-message">
                    No valid historical records are available.
                </div>
            ) : (
                <div className="historical-summary-grid">
                    {metrics.map((metric) => (
                        <article
                            className="panel historical-metric-card"
                            key={metric.label}
                        >
                            <div className="historical-metric-top">
                                <span className="historical-metric-icon">
                                    {metric.icon === "database" && "▤"}
                                    {metric.icon === "activity" && "⌁"}
                                    {metric.icon === "zap" && "ϟ"}
                                    {metric.icon === "sun" && "☼"}
                                </span>
                                <span className="historical-metric-label">
                                    {metric.label}
                                </span>
                            </div>

                            <strong className="historical-metric-value">
                                {metric.value}
                            </strong>

                            <span className="historical-metric-detail">
                                {metric.detail}
                            </span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default HistoricalSummary;
