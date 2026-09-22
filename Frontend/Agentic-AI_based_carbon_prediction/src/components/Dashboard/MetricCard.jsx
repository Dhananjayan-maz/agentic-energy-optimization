function MetricCard({
  title,
  value,
  unit,
  icon,
  description,
  type = "default",
}) {
  return (
    <div className={`metric-card metric-${type}`}>
      <div className="metric-card-top">
        <span className="metric-icon">{icon}</span>

        <span className="metric-title">{title}</span>
      </div>

      <div className="metric-value">
        {value}
        <span>{unit}</span>
      </div>

      <p className="metric-description">{description}</p>
    </div>
  );
}

export default MetricCard;