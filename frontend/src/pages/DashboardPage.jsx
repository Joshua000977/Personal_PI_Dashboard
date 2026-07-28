import { useEffect, useState } from "react";

import SystemStats from "../components/SystemStats";
import useSystemData from "../hooks/useSystemData";
import "./DashboardPage.css";

const quickActions = [
  { title: "Restart Pi", icon: "↻" },
  { title: "Shutdown", icon: "⏻" },
  { title: "Open Terminal", icon: ">_" },
  { title: "Settings", icon: "⚙" },
];

const activity = [
  {
    title: "Dashboard started",
    description: "Frontend and backend are online",
    time: "Now",
  },
  {
    title: "System updated",
    description: "All packages are up to date",
    time: "Earlier",
  },
  {
    title: "GitHub synchronized",
    description: "Latest changes pushed successfully",
    time: "Yesterday",
  },
];

function DashboardPage() {
  const {
    systemData,
    backendOnline,
  } = useSystemData();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(clockInterval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Joshua. Everything looks good.</p>
          <p>
  Viewport: {window.innerWidth} × {window.innerHeight}
</p>
        </div>

        <div className="dashboard-topbar-right">
          <div className="time-box">
            <strong>{formattedTime}</strong>
            <span>{formattedDate}</span>
          </div>

          <div className="avatar">JT</div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span
              className={`status-dot ${backendOnline ? "online" : "offline"}`}
            />
            {backendOnline ? "All systems operational" : "Backend offline"}
          </div>

          <h2>Your Raspberry Pi is running smoothly.</h2>

          <p>
            Monitor performance, launch applications and control your projects
            from one central dashboard.
          </p>

          <div className="hero-meta">
            <span>
              Uptime: {systemData?.system.uptime ?? "Waiting for backend"}
            </span>
            <span>IP: {systemData?.system.ip_address ?? "Not available"}</span>
          </div>
        </div>
      </section>

      <SystemStats systemData={systemData} />

      <section className="lower-grid">
        <article className="dashboard-card">
          <div className="section-heading">
            <h3>Quick actions</h3>
            <span>System controls</span>
          </div>

          <div className="actions-grid">
            {quickActions.map((action) => (
              <button
                className="action-button"
                key={action.title}
                type="button"
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-title">{action.title}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="section-heading">
            <h3>Recent activity</h3>
            <span>Latest events</span>
          </div>

          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-item" key={item.title}>
                <span className="activity-dot" />

                <div className="activity-text">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>

                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

export default DashboardPage;
