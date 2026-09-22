import { useMemo } from "react";

function EnergyChart({ data = [] }) {
  const chart = useMemo(() => {
    if (!data.length) return null;

    const width = 900;
    const height = 280;
    const padding = 45;

    const values = data.map((item) => item.value);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {
      const x =
        padding +
        (index / Math.max(data.length - 1, 1)) *
          (width - padding * 2);

      const y =
        height -
        padding -
        ((item.value - minValue) / range) *
          (height - padding * 2);

      return {
        x,
        y,
        value: item.value,
        time: item.time,
      };
    });

    return {
      width,
      height,
      padding,
      points,
    };
  }, [data]);

  if (!chart) {
    return (
      <div className="empty-chart">
        No energy data available.
      </div>
    );
  }

  const polyline = chart.points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <section className="dashboard-section chart-section">
      <div className="section-heading">
        <div>
          <p className="section-label">HISTORICAL DATA</p>
          <h2>Energy Consumption</h2>
        </div>

        <span className="chart-unit">kWh</span>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="line-chart"
          role="img"
          aria-label="Energy consumption historical chart"
        >
          {[0, 1, 2, 3].map((line) => {
            const y =
              chart.padding +
              (line / 3) *
                (chart.height - chart.padding * 2);

            return (
              <line
                key={line}
                x1={chart.padding}
                y1={y}
                x2={chart.width - chart.padding}
                y2={y}
                className="chart-grid-line"
              />
            );
          })}

          <polyline
            points={polyline}
            fill="none"
            className="energy-line"
          />

          {chart.points.map((point) => (
            <circle
              key={`${point.time}-${point.value}`}
              cx={point.x}
              cy={point.y}
              r="4"
              className="energy-point"
            />
          ))}

          {chart.points.map((point) => (
            <text
              key={`label-${point.time}`}
              x={point.x}
              y={chart.height - 12}
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
          Latest reading:{" "}
          <strong>{data[data.length - 1].value} kWh</strong>
        </span>

        <span>Historical consumption</span>
      </div>
    </section>
  );
}

export default EnergyChart;