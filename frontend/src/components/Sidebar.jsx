import { NavLink } from "react-router-dom";
import "./Sidebar.css";
function Sidebar() {
  const linkClass = ({ isActive }) => `nav-item ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">P</div>

        <div className="logo-text">
          <strong>Personal Pi Dashboard</strong>
          <span>Control Center</span>
        </div>
      </div>

      <p className="nav-label">Overview</p>

      <nav className="nav">
        <NavLink to="/" end className={linkClass}>
          <span className="nav-icon">⌂</span>
          Dashboard
        </NavLink>

        <NavLink to="/applications" className={linkClass}>
          <span className="nav-icon">▦</span>
          Applications
        </NavLink>

        <NavLink to="/system" className={linkClass}>
          <span className="nav-icon">⌁</span>
          System
        </NavLink>

        <NavLink to="/storage" className={linkClass}>
          <span className="nav-icon">◫</span>
          Storage
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <span className="nav-icon">⚙</span>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
