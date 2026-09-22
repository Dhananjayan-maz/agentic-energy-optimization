function SensorStatus({ sensors = [] }) {
  return (
    <section className="dashboard-section sensor-section">
      <div className="section-heading">
        <div>
          <p className="section-label">MONITORING</p>
          <h2>Sensor Status</h2>
        </div>

        <span className="live-badge">
          <span className="status-dot"></span>
          Live
        </span>
      </div>

      <div className="sensor-grid">
        {sensors.map((sensor) => (
          <div className="sensor-card" key={sensor.name}>
            <div className="sensor-card-header">
              <span className="sensor-name">{sensor.name}</span>

              <span
                className={`sensor-status ${
                  sensor.status === "online" ? "online" : "offline"
                }`}
              >
                <span></span>
                {sensor.status === "online" ? "Online" : "Offline"}
              </span>
            </div>

            <div className="sensor-value">{sensor.value}</div>

            <p>Updated {sensor.lastUpdated}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SensorStatus;