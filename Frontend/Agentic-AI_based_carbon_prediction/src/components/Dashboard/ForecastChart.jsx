function ForecastChart({
  data = [],
  title = "Energy Forecast",
  unit = "kWh",
  type = "energy",
}) {
  if (!data.length) {
    return (
      <section className="dashboard-section chart-section">
        <div className="empty-chart">
          No forecast data available.
        </div>
      </section>
    );
  }

  const width = 900;
  const height = 280;
  const padding = 45;

  const values = data.flatMap((item) => [
    item.actual ?? 0,
    item.forecast ?? 0,
  ]);

  const maxValue = Math.max(...values, 1);

  const points = data.map((item, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      ((item.forecast ?? 0) / maxValue) *
        (height - padding * 2);

    return {
      x,
      y,
      time: item.time,
      forecast: item.forecast,
    };
  });

  const forecastLine = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <section className="dashboard-section chart-section">
      <div className="section-heading">
        <div>
          <p className="section-label">PREDICTIVE INTELLIGENCE</p>
          <h2>{title}</h2>
        </div>

        <span className="forecast-badge">
          Forecast · {unit}
        </span>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="line-chart"
          role="img"
          aria-label={`${title} chart`}
        >
          {[0, 1, 2, 3].map((line) => {
            const y =
              padding +
              (line / 3) * (height - padding * 2);

            return (
              <line
                key={line}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                className="chart-grid-line"
              />
            );
          })}

          <polyline
            points={forecastLine}
            fill="none"
            className={
              type === "solar"
                ? "solar-line forecast-line"
                : "energy-line forecast-line"
            }
          />

          {points.map((point) => (
            <circle
              key={point.time}
              cx={point.x}
              cy={point.y}
              r="4"
              className={
                type === "solar"
                  ? "solar-point"
                  : "energy-point"
              }
            />
          ))}

          {points.map((point) => (
            <text
              key={`label-${point.time}`}
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              className="chart-label"
            >
              {point.time}
            </text>
          ))}
        </svg>
      </div>

      <div className="chart-footer">
        <span>
          Next prediction:{" "}
          <strong>
            {data[0].forecast} {unit}
          </strong>
        </span>

        <span>
          Model results will come from the backend forecasting
          service.
        </span>
      </div>
    </section>
  );
}

export default ForecastChart;