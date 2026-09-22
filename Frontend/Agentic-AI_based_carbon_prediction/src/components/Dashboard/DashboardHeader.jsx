function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <div>
        <p className="dashboard-eyebrow">PHASE 1 · SMART ENERGY MONITORING</p>

        <h1>Energy Intelligence Dashboard</h1>

        <p className="dashboard-subtitle">
          Monitor energy consumption, renewable generation and predicted
          energy conditions.
        </p>
      </div>

      <div className="header-status">
        <span className="status-dot"></span>

        <div>
          <span className="status-title">System Online</span>
          <span className="status-time">Live monitoring</span>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;