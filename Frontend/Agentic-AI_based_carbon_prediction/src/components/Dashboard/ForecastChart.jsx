function ForecastChart({
    data = [],
    title = "Energy Forecast",
    unit = "kWh",
    type = "energy",
}) {
    // ------------------------------------------
    // EMPTY STATE
    // ------------------------------------------

    if (!data.length) {
        return (
            <section className="dashboard-section chart-section">
                <div className="empty-chart">
                    No forecast data available.
                </div>
            </section>
        );
    }

    // ------------------------------------------
    // CHART DIMENSIONS
    // ------------------------------------------

    const width = 900;
    const height = 300;

    const paddingLeft = 55;
    const paddingRight = 35;
    const paddingTop = 30;
    const paddingBottom = 45;

    const chartWidth =
        width - paddingLeft - paddingRight;

    const chartHeight =
        height - paddingTop - paddingBottom;


    // ------------------------------------------
    // GET FORECAST VALUES
    // ------------------------------------------

    const values = data.map((item) => {
        return Number(
            item.value ?? item.forecast ?? 0
        );
    });


    // ------------------------------------------
    // FIND MAXIMUM VALUE
    // ------------------------------------------

    const maxValue = Math.max(...values, 1);

    // Add some space above the highest point
    const chartMax = maxValue * 1.1;


    // ------------------------------------------
    // CREATE POINTS
    // ------------------------------------------

    const points = data.map((item, index) => {

        const value = Number(
            item.value ?? item.forecast ?? 0
        );

        const x =
            paddingLeft +
            (index /
                Math.max(data.length - 1, 1)) *
                chartWidth;

        const y =
            paddingTop +
            chartHeight -
            (value / chartMax) * chartHeight;

        return {
            x,
            y,
            time: item.time,
            value,
        };
    });


    // ------------------------------------------
    // CREATE SVG LINE
    // ------------------------------------------

    const forecastLine = points
        .map((point) => `${point.x},${point.y}`)
        .join(" ");


    // ------------------------------------------
    // Y-AXIS GRID LINES
    // ------------------------------------------

    const gridLines = [0, 1, 2, 3, 4];


    // ------------------------------------------
    // DASHBOARD
    // ------------------------------------------

    return (
        <section className="dashboard-section chart-section">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="section-heading">

                <div>

                    <p className="section-label">
                        PREDICTIVE INTELLIGENCE
                    </p>

                    <h2>
                        {title}
                    </h2>

                </div>

                <span className="forecast-badge">
                    Forecast · {unit}
                </span>

            </div>


            {/* ==================================
                CHART
            ================================== */}

            <div className="chart-container">

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="line-chart"
                    role="img"
                    aria-label={`${title} chart`}
                >

                    {/* ==========================
                        HORIZONTAL GRID LINES
                    ========================== */}

                    {gridLines.map((line) => {

                        const y =
                            paddingTop +
                            (line / 4) *
                                chartHeight;

                        return (
                            <line
                                key={line}
                                x1={paddingLeft}
                                y1={y}
                                x2={
                                    width -
                                    paddingRight
                                }
                                y2={y}
                                className="chart-grid-line"
                            />
                        );
                    })}


                    {/* ==========================
                        FORECAST LINE
                    ========================== */}

                    <polyline
                        points={forecastLine}
                        fill="none"
                        className={
                            type === "solar"
                                ? "solar-line forecast-line"
                                : "energy-line forecast-line"
                        }
                    />


                    {/* ==========================
                        DATA POINTS
                    ========================== */}

                    {points.map((point) => (

                        <circle
                            key={point.time}
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            className={
                                type === "solar"
                                    ? "solar-point"
                                    : "energy-point"
                            }
                        />

                    ))}


                    {/* ==========================
                        X-AXIS TIME LABELS
                    ========================== */}

                    {points.map((point) => (

                        <text
                            key={`label-${point.time}`}
                            x={point.x}
                            y={
                                height -
                                15
                            }
                            textAnchor="middle"
                            className="chart-label"
                        >
                            {point.time}
                        </text>

                    ))}


                    {/* ==========================
                        VALUE LABELS
                    ========================== */}

                    {points.map((point) => (

                        <text
                            key={`value-${point.time}`}
                            x={point.x}
                            y={point.y - 12}
                            textAnchor="middle"
                            className="chart-value-label"
                        >
                            {point.value}
                        </text>

                    ))}

                </svg>

            </div>


            {/* ==================================
                FOOTER
            ================================== */}

            <div className="chart-footer">

                <span>
                    Next prediction:{" "}
                    <strong>
                        {points[0].value} {unit}
                    </strong>
                </span>

                <span>
                    Model results will come from the
                    backend forecasting service.
                </span>

            </div>

        </section>
    );
}

export default ForecastChart;