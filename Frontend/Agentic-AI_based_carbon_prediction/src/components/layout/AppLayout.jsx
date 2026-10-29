import Sidebar from "./Sidebar";
import "./AppLayout.css";

export default function AppLayout({ children, pageClassName = "" }) {
  return (
    <div className={`energiq-app-shell ${pageClassName}`.trim()}>
      <Sidebar />
      <main className="energiq-main-content">{children}</main>
    </div>
  );
}
