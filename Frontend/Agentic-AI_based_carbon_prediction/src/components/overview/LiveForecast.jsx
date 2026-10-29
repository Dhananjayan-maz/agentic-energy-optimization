
import "./LiveForecast.css";

function formatNumber(value, digits = 3) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "N/A";
}

function LiveForecast({ forecastData, forecastError }) {
    const energyForecast =
        forecastData?.energy_forecast ??
        forecastData?.predicted_energy ??
        forecastData?.energy_prediction;

    const solarForecast =
        forecastData?.solar_forecast ??
        forecastData?.predicted_solar ??
        forecastData?.solar_prediction;

    const hasForecast = forecastData != null;

    return (
        <article className="panel live-forecast-panel">
            <div className="panel-heading">
                <div>
                    <p className="eyebrow">PREDICTIVE INTELLIGENCE</p>
                    <h2>Live AI forecast</h2>
                    <p className="panel-description">
                        Predictions generated from the live forecasting pipeline
                    </p>
                </div>

                <span className="forecast-badge">AI FORECAST</span>
            </div>

            {forecastError && (
                <p className="inline-alert" role="alert">
                    {forecastError}
                </p>
            )}

            {!hasForecast && !forecastError && (
                <p className="empty-state">
                    Waiting for forecast data…
                </p>
            )}

            {hasForecast && (
                <>
                    <div className="forecast-metrics-grid">
                        <div className="forecast-metric-card">
                            <span className="forecast-metric-label">
                                Predicted energy
                            </span>

                            <strong>
                                {formatNumber(energyForecast)}
                                <small> kWh</small>
                            </strong>

                            <span className="forecast-metric-caption">
                                Energy consumption forecast
                            </span>
                        </div>

                        <div className="forecast-metric-card solar-forecast-card">
                            <span className="forecast-metric-label">
                                Predicted solar
                            </span>

                            <strong>
                                {formatNumber(solarForecast)}
                                <small> kWh</small>
                            </strong>

                            <span className="forecast-metric-caption">
                                Solar generation forecast
                            </span>
                        </div>
                    </div>

                    <div className="forecast-information">
                        <span>
                            Forecast status
                            <strong>
                                {forecastData.status === "ready"
                                    ? "Ready"
                                    : forecastData.status || "Available"}
                            </strong>
                        </span>

                        {forecastData.timestamp && (
                            <span>
                                Generated at
                                <strong>
                                    {new Date(
                                        forecastData.timestamp
                                    ).toLocaleTimeString()}
                                </strong>
                            </span>
                        )}
                    </div>

                    <div className="forecast-source-details">
                        <span>
                            Source
                            <strong>{forecastData.source || "N/A"}</strong>
                        </span>

                        <span>
                            Intervals available
                            <strong>
                                {forecastData.intervals_available ?? "N/A"}
                            </strong>
                        </span>
                    </div>

                    {forecastData.message && (
                        <p className="forecast-message">
                            {forecastData.message}
                        </p>
                    )}

                    <p className="forecast-disclaimer">
                        Forecasts are model predictions, not measured readings.
                        Their accuracy depends on the available input data and
                        model validation.
                    </p>
                </>
            )}
        </article>
    );
}

export default LiveForecast;
