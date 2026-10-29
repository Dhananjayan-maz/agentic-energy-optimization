
import { useState } from "react";
import "./RecentRejections.css";

function formatTimestamp(timestamp) {
    if (!timestamp) return "Not available";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Invalid timestamp";
    }

    return date.toLocaleString();
}

function RecentRejections({ rejections = [] }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="panel recent-rejections-panel">
            <button
                type="button"
                className="rejections-toggle"
                onClick={() => setIsExpanded((previous) => !previous)}
                aria-expanded={isExpanded}
            >
                <span className="rejections-toggle-content">
                    <span className="rejections-icon" aria-hidden="true">
                        !
                    </span>

                    <span>
                        <span className="rejections-title">
                            Recent rejected messages
                        </span>

                        <span className="rejections-subtitle">
                            {rejections.length} recent rejection
                            {rejections.length === 1 ? "" : "s"} reported
                        </span>
                    </span>
                </span>

                <span className="rejections-toggle-right">
                    <span className="rejections-toggle-label">
                        {isExpanded ? "Hide details" : "View details"}
                    </span>

                    <span
                        className={`rejections-chevron ${
                            isExpanded ? "rejections-chevron-open" : ""
                        }`}
                        aria-hidden="true"
                    >
                       ⌄
                    </span>
                </span>
            </button>

            {isExpanded && (
                <div className="rejections-content">
                    {rejections.length === 0 ? (
                        <p className="rejections-empty">
                            No recent rejected messages were returned
                            by the backend.
                        </p>
                    ) : (
                        <div className="rejections-list">
                            {rejections.map((item, index) => (
                                <article
                                    className="rejection-item"
                                    key={`${item.received_at || "unknown"}-${index}`}
                                >
                                    <div className="rejection-item-header">
                                        <span className="rejection-number">
                                            Rejection {index + 1}
                                        </span>

                                        <span className="rejection-time">
                                            {formatTimestamp(item.received_at)}
                                        </span>
                                    </div>

                                    <div className="rejection-field">
                                        <span>Device ID</span>

                                        <strong>
                                            {item.device_id || "Not provided"}
                                        </strong>
                                    </div>

                                    <div className="rejection-field">
                                        <span>Reason</span>

                                        <p>{item.reason || "No reason provided"}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default RecentRejections;
