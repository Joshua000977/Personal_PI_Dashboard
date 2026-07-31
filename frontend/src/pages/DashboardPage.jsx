import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../config";
import SystemStats from "../components/SystemStats";
import useSystemData from "../hooks/useSystemData";
import { useSettings } from "../context/SettingsContext";
import { getSystemStatus } from "../utils/getSystemStatus";
import "./DashboardPage.css";

const quickActions = [
  {
    id: "restart",
    title: "Restart Pi",
    icon: "↻",
  },
  {
    id: "shutdown",
    title: "Shutdown",
    icon: "⏻",
  },
  {
    id: "settings",
    title: "Settings",
    icon: "⚙",
    path: "/settings",
  },
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
  const { systemData, backendOnline } = useSystemData();

  const [currentTime, setCurrentTime] = useState(new Date());
  const { settings } = useSettings();

  const systemStatus = getSystemStatus({
    systemData,
    backendOnline,
    temperatureWarningLimit: settings.temperatureWarningLimit,
  });

  const navigate = useNavigate();

  const [selectedPowerAction, setSelectedPowerAction] = useState(null);

  const [powerActionLoading, setPowerActionLoading] = useState(false);

  const [powerActionError, setPowerActionError] = useState("");

  const [powerActionSent, setPowerActionSent] = useState(false);

  function handleQuickAction(action) {
    if (action.path) {
      navigate(action.path);
      return;
    }

    setSelectedPowerAction(action);
    setPowerActionError("");
    setPowerActionSent(false);
  }
  function closePowerDialog() {
    if (powerActionLoading || powerActionSent) {
      return;
    }

    setSelectedPowerAction(null);
    setPowerActionError("");
  }

  async function confirmPowerAction() {
    if (!selectedPowerAction) {
      return;
    }

    setPowerActionLoading(true);
    setPowerActionError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/system/${selectedPowerAction.id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      setPowerActionSent(true);
    } catch (requestError) {
      console.error("Could not execute power action:", requestError);

      setPowerActionError(requestError.message);
    } finally {
      setPowerActionLoading(false);
    }
  }
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
          <div
            className={`dashboard-hero__status dashboard-hero__status--${systemStatus.dashboardStatus.variant}`}
          >
            <span className="dashboard-hero__status-dot" />

            {systemStatus.dashboardStatus.text}
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

      <SystemStats systemData={systemData} systemStatus={systemStatus} />

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
                onClick={() => handleQuickAction(action)}
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
      {selectedPowerAction && (
        <div
          className="power-dialog-backdrop"
          role="presentation"
          onClick={closePowerDialog}
        >
          <section
            className="power-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="power-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="power-dialog__icon">
              {selectedPowerAction.icon}
            </span>

            {!powerActionSent ? (
              <>
                <h3 id="power-dialog-title">{selectedPowerAction.title}?</h3>

                <p>
                  {selectedPowerAction.id === "restart"
                    ? "The dashboard will be unavailable briefly while the Raspberry Pi restarts."
                    : "The Raspberry Pi will shut down completely and must be powered on manually."}
                </p>

                {powerActionError && (
                  <p className="power-dialog__error">{powerActionError}</p>
                )}

                <div className="power-dialog__actions">
                  <button
                    className="power-dialog__button power-dialog__button--cancel"
                    type="button"
                    disabled={powerActionLoading}
                    onClick={closePowerDialog}
                  >
                    Cancel
                  </button>

                  <button
                    className="power-dialog__button power-dialog__button--confirm"
                    type="button"
                    disabled={powerActionLoading}
                    onClick={confirmPowerAction}
                  >
                    {powerActionLoading
                      ? "Sending..."
                      : selectedPowerAction.title}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 id="power-dialog-title">Command sent</h3>

                <p>
                  The Raspberry Pi will disconnect from the dashboard shortly.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
