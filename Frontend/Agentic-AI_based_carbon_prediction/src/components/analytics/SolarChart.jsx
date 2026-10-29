
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import "./SolarChart.css";

function formatTimestamp(timestamp) {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function SolarChart({ history = [], loading = false, error = "" }) {
    const chartData = [...history]
        .filter(
            (item) =>
                item.timestamp &&
                Number.isFinite(Number(item.solar_generation_kwh))
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map((item) => ({
            timestamp: item.timestamp,
            timeLabel: formatTimestamp(item.timestamp),
            solar: Number(item.solar_generation_kwh),
        }));

    return (
        <section className="panel solar-chart-panel">
            <div className="solar-chart-heading">
                <div>
                    <p className="eyebrow">RENEWABLE ENERGY ANALYSIS</p>
                    <h2>Solar generation</h2>
                    <p>
                        Historical solar energy generation across recorded intervals.
                    </p>
                </div>

                <span className="solar-chart-unit">kWh</span>
            </div>

            {loading ? (
                <div className="solar-chart-message">
                    Loading solar history...
                </div>
            ) : error ? (
                <div className="solar-chart-message solar-chart-error">
                    {error}
                </div>
            ) : chartData.length === 0 ? (
                <div className="solar-chart-message">
                    No historical solar readings are available.
                </div>
            ) : (
                <div className="solar-chart-canvas">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 12, right: 18, left: 4, bottom: 8 }}
                        >
                            <CartesianGrid
                                stroke="#e8edf3"
                                strokeDasharray="4 4"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="timeLabel"
                                minTickGap={35}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                width={48}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, "auto"]}
                            />

                            <Tooltip
                                labelFormatter={(_, payload) =>
                                    payload?.[0]?.payload?.timestamp
                                        ? new Date(
                                              payload[0].payload.timestamp
                                          ).toLocaleString()
                                        : ""
                                }
                                formatter={(value) => [
                                    `${Number(value).toFixed(4)} kWh`,
                                    "Solar generation",
                                ]}
                                contentStyle={{
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="solar"
                                name="Solar generation"
                                stroke="#d97706"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5 }}
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="solar-chart-footer">
                Showing {chartData.length.toLocaleString()} valid readings
                {chartData.length > 0
                    ? ` · ${formatTimestamp(chartData[0].timestamp)} to ${formatTimestamp(chartData[chartData.length - 1].timestamp)}`
                    : ""}
            </div>
        </section>
    );
}

export default SolarChart;
