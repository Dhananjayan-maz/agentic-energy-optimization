
import "./QualitySummary.css";

function formatTimestamp(timestamp) {
    if (!timestamp) return "Not available";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Invalid timestamp";
    }

    return date.toLocaleString();
}

function QualitySummary({ data, error, loading }) {
    if (loading && !data) {
        return (
            <section className="panel quality-loading">
                <p className="eyebrow">DATA VALIDATION</p>
                <h2>Loading data quality...</h2>
                <p>Please wait while the backend is checked.</p>
            </section>
        );
    }

    if (error && !data) {
        return (
            <section className="panel quality-error" role="alert">
                <p className="eyebrow">DATA VALIDATION</p>
                <h2>Unable to load data quality</h2>
                <p>{error}</p>
            </section>
        );
    }

    if (!data) return null;

    const checks = data.checks || {};

    const status = String(data.status || "unknown").toLowerCase();

    const statusLabel =
        status === "healthy"
            ? "Healthy"
            : status.charAt(0).toUpperCase() + status.slice(1);

    const checkItems = [
        {
            label: "Data availability",
            value: checks.data_available === true ? "Available" : "Unavailable",
            healthy: checks.data_available === true,
        },
        {
            label: "Data freshness",
            value: checks.freshness || "Unknown",
            healthy: checks.freshness === "fresh",
        },
        {
            label: "Numeric values",
            value: checks.numeric_values || "Unknown",
            healthy: checks.numeric_values === "valid",
        },
        {
            label: "Value ranges",
            value: checks.value_ranges || "Unknown",
            healthy: checks.value_ranges === "valid",
        },
    ];

    return (
        <div className="quality-summary">
            {error && (
                <p className="quality-stale-notice" role="status">
                    Latest refresh failed. Showing the last successfully
                    retrieved data.
                </p>
            )}

            <section className="panel quality-status-panel">
                <div className="quality-status-heading">
                    <div>
                        <p className="eyebrow">DATA VALIDATION</p>
                        <h2>Data quality status</h2>
                        <p className="panel-description">
                            Validation and freshness information reported
                            by the backend.
                        </p>
                    </div>

                    <span
                        className={`quality-status-badge ${
                            status === "healthy"
                                ? "quality-status-healthy"
                                : "quality-status-warning"
                        }`}
                    >
                        <span className="quality-status-dot" />
                        {statusLabel}
                    </span>
                </div>

                <div className="quality-metrics-grid">
                    <article className="quality-metric-card">
                        <span className="quality-metric-label">
                            Total readings
                        </span>
                        <strong className="quality-metric-value">
                            {(data.total_readings ?? 0).toLocaleString()}
                        </strong>
                        <span className="quality-metric-caption">
                            Readings recorded
                        </span>
                    </article>

                    <article className="quality-metric-card">
                        <span className="quality-metric-label">
                            Rejected messages
                        </span>
                        <strong className="quality-metric-value">
                            {(data.rejected_messages ?? 0).toLocaleString()}
                        </strong>
                        <span className="quality-metric-caption">
                            Messages rejected by validation
                        </span>
                    </article>

                    <article className="quality-metric-card">
                        <span className="quality-metric-label">
                            Duplicate messages
                        </span>
                        <strong className="quality-metric-value">
                            {(data.duplicate_messages ?? 0).toLocaleString()}
                        </strong>
                        <span className="quality-metric-caption">
                            Duplicate messages detected
                        </span>
                    </article>
                </div>

                <div className="quality-latest-reading">
                    <div>
                        <span className="quality-detail-label">
                            Latest reading timestamp
                        </span>
                        <strong>
                            {formatTimestamp(data.latest_timestamp)}
                        </strong>
                    </div>

                    <div>
                        <span className="quality-detail-label">
                            Reading age
                        </span>
                        <strong>
                            {Number.isFinite(Number(data.age_seconds))
                                ? `${Number(data.age_seconds).toFixed(1)} seconds`
                                : "Not available"}
                        </strong>
                    </div>
                </div>
            </section>

            <section className="panel quality-checks-panel">
                <div className="panel-heading">
                    <div>
                        <p className="eyebrow">VALIDATION DETAILS</p>
                        <h2>Quality checks</h2>
                        <p className="panel-description">
                            Results from the available backend checks.
                        </p>
                    </div>
                </div>

                <div className="quality-check-list">
                    {checkItems.map((item) => (
                        <div
                            className="quality-check-row"
                            key={item.label}
                        >
                            <div className="quality-check-name">
                                <span
                                    className={`quality-check-indicator ${
                                        item.healthy
                                            ? "check-passed"
                                            : "check-attention"
                                    }`}
                                >
                                    {item.healthy ? "✓" : "!"}
                                </span>

                                <span>{item.label}</span>
                            </div>

                            <span
                                className={`quality-check-value ${
                                    item.healthy
                                        ? "check-value-passed"
                                        : "check-value-attention"
                                }`}
                            >
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default QualitySummary;
