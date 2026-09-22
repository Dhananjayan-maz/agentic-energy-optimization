function SensorStatus({ sensors }) {
    if (!sensors) {
        return null;
    }

    const sensorList = [
        {
            key: "energy",
            name: "Energy Sensor",
            icon: "⚡",
        },
        {
            key: "solar",
            name: "Solar Sensor",
            icon: "☀",
        },
        {
            key: "temperature",
            name: "Temperature Sensor",
            icon: "🌡",
        },
        {
            key: "humidity",
            name: "Humidity Sensor",
            icon: "💧",
        },
    ];

    return (
        <section className="sensor-section">

            <div className="section-heading">
                <div>
                    <p className="section-eyebrow">
                        SENSOR MONITORING
                    </p>

                    <h2>
                        Sensor Status
                    </h2>

                    <p>
                        Current connectivity status of the
                        smart energy monitoring sensors.
                    </p>
                </div>
            </div>

            <div className="sensor-grid">

                {sensorList.map((sensor) => {

                    const isOnline = Boolean(
                        sensors[sensor.key]
                    );

                    return (
                        <div
                            className="sensor-card"
                            key={sensor.key}
                        >

                            <div className="sensor-icon">
                                {sensor.icon}
                            </div>

                            <div className="sensor-info">

                                <h3>
                                    {sensor.name}
                                </h3>

                                <div
                                    className={
                                        isOnline
                                            ? "sensor-status online"
                                            : "sensor-status offline"
                                    }
                                >
                                    <span className="status-dot"></span>

                                    {isOnline
                                        ? "Online"
                                        : "Offline"}
                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

        </section>
    );
}

export default SensorStatus;