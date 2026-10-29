import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navigationItems = [
  {
    to: "/dashboard",
    label: "Overview",
    symbol: "◫",
    end: true,
  },
  {
    to: "/dashboard/data-quality",
    label: "Data Quality",
    symbol: "◎",
  },
  {
    to: "/dashboard/analytics",
    label: "Historical Analytics",
    symbol: "▥",
  },
];

export default function Sidebar() {
  return (
    <aside className="energiq-sidebar" aria-label="Main navigation">
      <div className="energiq-brand">
        <div className="energiq-brand-mark" aria-hidden="true">
          <span>ϟ</span>
        </div>
        <div className="energiq-brand-copy">
          <span className="energiq-brand-name">EnergiQ</span>
          <span className="energiq-brand-caption">SMART ENERGY INTELLIGENCE</span>
        </div>
      </div>

      <div className="energiq-nav-label">WORKSPACE</div>
      <nav className="energiq-navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `energiq-nav-link${isActive ? " is-active" : ""}`
            }
          >
            <span className="energiq-nav-symbol" aria-hidden="true">
              {item.symbol}
            </span>
            <span>{item.label}</span>
            {item.to === "/dashboard" && (
              <span className="energiq-nav-live-dot" aria-label="Main page" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="energiq-sidebar-footer">
        <div className="energiq-system-indicator" aria-hidden="true" />
        <div>
          <div className="energiq-system-title">Energy system</div>
          <div className="energiq-system-subtitle">Monitoring workspace</div>
        </div>
      </div>
    </aside>
  );
}
