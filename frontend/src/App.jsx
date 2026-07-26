import { useEffect, useState } from "react";

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

function App() {
  const [systemData, setSystemData] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(clockInterval);
    };
  }, []);

  useEffect(() => {
    const loadSystemData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/system");

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();

        setSystemData(data);
        setBackendOnline(true);
      } catch (error) {
        console.error("Could not load system information:", error);
        setBackendOnline(false);
      }
    };

    loadSystemData();

    const dataInterval = window.setInterval(loadSystemData, 3000);

    return () => {
      window.clearInterval(dataInterval);
    };
  }, []);

  const systemCards = [
    {
      title: "CPU Usage",
      value: systemData ? `${systemData.cpu.usage_percent.toFixed(0)}%` : "--%",
      detail: systemData
        ? `${systemData.cpu.cores} logical cores`
        : "Loading system data",
      icon: "CPU",
      progress: systemData?.cpu.usage_percent ?? 0,
    },
    {
      title: "Memory",
      value: systemData ? `${systemData.memory.used_gb} GB` : "-- GB",
      detail: systemData
        ? `of ${systemData.memory.total_gb} GB used`
        : "Loading system data",
      icon: "RAM",
      progress: systemData?.memory.usage_percent ?? 0,
    },
    {
      title: "Temperature",
      value:
        systemData?.cpu.temperature_celsius !== null &&
        systemData?.cpu.temperature_celsius !== undefined
          ? `${systemData.cpu.temperature_celsius}°C`
          : "--°C",
      detail:
        systemData?.cpu.temperature_celsius < 70
          ? "System temperature normal"
          : "System temperature high",
      icon: "TEMP",
      progress: systemData?.cpu.temperature_celsius ?? 0,
    },
    {
      title: "Storage",
      value: systemData ? `${systemData.storage.used_gb} GB` : "-- GB",
      detail: systemData
        ? `of ${systemData.storage.total_gb} GB used`
        : "Loading system data",
      icon: "SSD",
      progress: systemData?.storage.usage_percent ?? 0,
    },
  ];

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
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          min-width: 320px;
          min-height: 100%;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        body {
          background: #090d16;
          color: #f6f7fb;
        }

        button {
          font: inherit;
        }

        .app {
          display: flex;
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 5%,
              rgba(85, 103, 255, 0.17),
              transparent 28%
            ),
            #090d16;
        }

        .sidebar {
          width: 245px;
          padding: 28px 18px;
          background: rgba(12, 17, 29, 0.94);
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          position: fixed;
          inset: 0 auto 0 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 10px 28px;
        }

        .logo-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          font-size: 18px;
          font-weight: 800;
          background: linear-gradient(145deg, #6d7dff, #8e5cff);
          box-shadow: 0 12px 30px rgba(100, 95, 255, 0.3);
        }

        .logo-text strong {
          display: block;
          font-size: 16px;
        }

        .logo-text span {
          color: #7f899e;
          font-size: 12px;
        }

        .nav-label {
          margin: 10px 12px;
          color: #626c81;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .nav {
          display: grid;
          gap: 7px;
        }

        .nav-item {
          width: 100%;
          padding: 13px 14px;
          border: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #939db1;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: 150ms ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .nav-item.active {
          color: #ffffff;
          background: linear-gradient(
            90deg,
            rgba(109, 125, 255, 0.22),
            rgba(109, 125, 255, 0.05)
          );
          border: 1px solid rgba(109, 125, 255, 0.22);
        }

        .nav-icon {
          width: 26px;
          text-align: center;
          font-size: 17px;
        }

        .sidebar-status {
          margin-top: auto;
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.025);
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #46dc97;
          box-shadow: 0 0 12px rgba(70, 220, 151, 0.8);
        }

        .sidebar-status p {
          margin: 0;
          color: #737d92;
          font-size: 12px;
        }

        .main {
          width: calc(100% - 245px);
          margin-left: 245px;
          padding: 32px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .topbar h1 {
          margin: 0 0 6px;
          font-size: clamp(25px, 3vw, 36px);
          letter-spacing: -0.04em;
        }

        .topbar p {
          margin: 0;
          color: #7e889d;
          font-size: 14px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .time-box {
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.035);
          text-align: right;
        }

        .time-box strong {
          display: block;
          font-size: 18px;
        }

        .time-box span {
          color: #737d91;
          font-size: 11px;
        }

        .avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(145deg, #313a54, #1d2333);
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          padding: 30px;
          margin-bottom: 22px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(
              120deg,
              rgba(80, 96, 225, 0.42),
              rgba(90, 61, 157, 0.22)
            ),
            #14192a;
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 330px;
          height: 330px;
          right: -90px;
          top: -140px;
          border-radius: 50%;
          background: rgba(137, 113, 255, 0.18);
          filter: blur(2px);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 620px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          margin-bottom: 18px;
          border-radius: 999px;
          color: #d8dcff;
          background: rgba(255, 255, 255, 0.09);
          font-size: 12px;
          font-weight: 700;
        }

        .hero h2 {
          margin: 0 0 10px;
          font-size: clamp(25px, 3vw, 38px);
          letter-spacing: -0.04em;
        }

        .hero p {
          max-width: 540px;
          margin: 0;
          color: #b9c0d1;
          line-height: 1.6;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .card {
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          background: rgba(17, 23, 38, 0.82);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.17);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .stat-title {
          color: #8c96aa;
          font-size: 13px;
          font-weight: 600;
        }

        .stat-icon {
          min-width: 43px;
          height: 43px;
          padding: 0 9px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #cfd4ff;
          background: rgba(109, 125, 255, 0.12);
          font-size: 10px;
          font-weight: 800;
        }

        .stat-value {
          margin: 0 0 5px;
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        .stat-detail {
          margin: 0 0 16px;
          color: #69748a;
          font-size: 12px;
        }

        .progress {
          height: 6px;
          border-radius: 100px;
          background: #242b3b;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #6678ff, #9e6bff);
        }

        .lower-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 20px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .section-heading h3 {
          margin: 0;
          font-size: 17px;
        }

        .section-heading span {
          color: #687389;
          font-size: 12px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .action-button {
          min-height: 95px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          color: #f2f4fb;
          background: rgba(255, 255, 255, 0.025);
          text-align: left;
          cursor: pointer;
          transition: 160ms ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          border-color: rgba(109, 125, 255, 0.4);
          background: rgba(109, 125, 255, 0.08);
        }

        .action-icon {
          display: block;
          margin-bottom: 15px;
          color: #8996ff;
          font-size: 22px;
          font-weight: 700;
        }

        .action-title {
          font-size: 13px;
          font-weight: 700;
        }

        .activity-list {
          display: grid;
          gap: 5px;
        }

        .activity-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 13px;
          align-items: center;
          padding: 13px 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .activity-item:last-child {
          border-bottom: 0;
        }

        .activity-dot {
          width: 11px;
          height: 11px;
          border: 3px solid rgba(113, 130, 255, 0.32);
          border-radius: 50%;
          background: #7888ff;
        }

        .activity-text strong {
          display: block;
          margin-bottom: 3px;
          font-size: 13px;
        }

        .activity-text span,
        .activity-time {
          color: #687389;
          font-size: 11px;
        }

        @media (max-width: 1050px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 780px) {
          .sidebar {
            display: none;
          }

          .main {
            width: 100%;
            margin-left: 0;
            padding: 20px;
          }

          .lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .topbar {
            align-items: flex-start;
          }

          .topbar-right {
            display: none;
          }

          .stats-grid,
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 23px;
          }
        }
      `}</style>

      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">P</div>

            <div className="logo-text">
              <strong>Pi Dashboard</strong>
              <span>Control Center</span>
            </div>
          </div>

          <p className="nav-label">Overview</p>

          <nav className="nav">
            <button className="nav-item active">
              <span className="nav-icon">⌂</span>
              Dashboard
            </button>

            <button className="nav-item">
              <span className="nav-icon">▦</span>
              Applications
            </button>

            <button className="nav-item">
              <span className="nav-icon">⌁</span>
              System
            </button>

            <button className="nav-item">
              <span className="nav-icon">◫</span>
              Storage
            </button>

            <button className="nav-item">
              <span className="nav-icon">⚙</span>
              Settings
            </button>
          </nav>

          <div className="sidebar-status">
            <div className="status-row">
              <span
                className="status-dot"
                style={{
                  background: backendOnline ? "#46dc97" : "#ff5c72",
                  boxShadow: backendOnline
                    ? "0 0 12px rgba(70, 220, 151, 0.8)"
                    : "0 0 12px rgba(255, 92, 114, 0.8)",
                }}
              />

              {backendOnline ? "Raspberry Pi Online" : "Backend Offline"}
            </div>

            <p>
              {systemData
                ? `IP address: ${systemData.system.ip_address}`
                : "Waiting for backend connection"}
            </p>

            <p>Connected through local network</p>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back, Joshua. Everything looks good.</p>
            </div>

            <div className="topbar-right">
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
                <span className="status-dot" />
                All systems operational
              </div>

              <h2>Your Raspberry Pi is running smoothly.</h2>

              <p>
                Monitor performance, launch applications and control your
                projects from one central dashboard.
              </p>
            </div>
          </section>
          {systemData && (
            <p
              style={{
                marginTop: "18px",
                color: "#d8dcff",
                fontWeight: 600,
              }}
            >
              Uptime: {systemData.system.uptime}
            </p>
          )}

          <section className="stats-grid">
            {systemCards.map((card) => (
              <article className="card" key={card.title}>
                <div className="stat-header">
                  <span className="stat-title">{card.title}</span>
                  <span className="stat-icon">{card.icon}</span>
                </div>

                <h3 className="stat-value">{card.value}</h3>
                <p className="stat-detail">{card.detail}</p>

                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </article>
            ))}
          </section>

          <section className="lower-grid">
            <article className="card">
              <div className="section-heading">
                <h3>Quick actions</h3>
                <span>System controls</span>
              </div>

              <div className="actions-grid">
                {quickActions.map((action) => (
                  <button className="action-button" key={action.title}>
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-title">{action.title}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="card">
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
        </main>
      </div>
    </>
  );
}

export default App;
