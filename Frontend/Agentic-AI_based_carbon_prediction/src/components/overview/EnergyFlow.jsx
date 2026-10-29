
import "./EnergyFlow.css";

function formatNumber(value, digits = 3) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "N/A";
}

function EnergyFlow({ liveData, liveError }) {
    const deviceStatus = liveData?.status || "offline";

    return (
        <article className="panel energy-flow-panel">
            <div className="panel-heading">
                <div>
                    <p className="eyebrow">REAL-TIME SYSTEM</p>
                    <h2>Energy flow</h2>
                    <p className="panel-description">
                        Current simulator readings at a glance
                    </p>
                </div>

                <span className={`status-pill status-${deviceStatus}`}>
                    <span />
                    {deviceStatus === "online"
                        ? "Device online"
                        : deviceStatus === "stale"
                            ? "Reading stale"
                            : "Device offline"}
                </span>
            </div>

            {liveError && (
                <p className="inline-alert" role="alert">{liveError}</p>
            )}

            {!liveData && !liveError && (
                <p className="empty-state">
                    Waiting for the first IoT reading…
                </p>
            )}

            {liveData && (
                <>
                    <div
                        className="flow-visual"
                        aria-label="Conceptual visualization of solar generation and energy consumption"
                    >
                        <div className="flow-node solar-node">
                            <div className="flow-node-icon">☼</div>
                            <span className="flow-node-label">SOLAR INPUT</span>
                            <strong>
                                {formatNumber(liveData.solar_generation_kwh)}
                                {" "}<small>kWh</small>
                            </strong>
                            <span className="flow-node-caption">
                                Simulated generation
                            </span>
                        </div>

                        <div className="flow-connector">
                            <span className="flow-connector-line" />
                            <span className="flow-connector-arrow"></span>
                            <span className="flow-connector-caption">
                                Energy data
                            </span>
                        </div>

                        <div className="flow-core">
                            <div className="flow-core-icon">⚡</div>
                            <strong>Smart energy</strong>
                            <span>Monitoring hub</span>
                        </div>

                        <div className="flow-connector">
                            <span className="flow-connector-line" />
                            <span className="flow-connector-arrow"></span>
                            <span className="flow-connector-caption">
                                Usage data
                            </span>
                        </div>

                        <div className="flow-node usage-node">
                            <div className="flow-node-icon">ϟ</div>
                            <span className="flow-node-label">ENERGY USE</span>
                            <strong>
                                {formatNumber(liveData.energy_consumption_kwh)}
                                {" "}<small>kWh</small>
                            </strong>
                            <span className="flow-node-caption">
                                Simulated consumption
                            </span>
                        </div>
                    </div>

                    <p className="flow-disclaimer">
                        Conceptual visualization of reported readings. It does
                        not represent measured grid import or a verified
                        energy balance.
                    </p>

                    <div className="live-details-grid">
                        <div className="live-detail">
                            <span>Temperature</span>
                            <strong>
                                {formatNumber(liveData.temperature, 1)}
                                {" "}<small>°C</small>
                            </strong>
                        </div>

                        <div className="live-detail">
                            <span>Humidity</span>
                            <strong>
                                {formatNumber(liveData.humidity, 1)}
                                {" "}<small>%</small>
                            </strong>
                        </div>

                        <div className="live-detail">
                            <span>Solar irradiance</span>
                            <strong>
                                {formatNumber(liveData.irradiance, 1)}
                                {" "}<small>W/m²</small>
                            </strong>
                        </div>
                    </div>

                    <div className="reading-meta">
                        <span>
                            Device <strong>{liveData.device_id || "N/A"}</strong>
                        </span>
                        <span>
                            Reading age{" "}
                            <strong>{liveData.age_seconds ?? "N/A"}s</strong>
                        </span>
                        <span>
                            Updated{" "}
                            <strong>
                                {liveData.timestamp
                                    ? new Date(liveData.timestamp).toLocaleTimeString()
                                    : "N/A"}
                            </strong>
                        </span>
                    </div>
                </>
            )}
        </article>
    );
}

export default EnergyFlow;
