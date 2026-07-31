import { useEffect, useState } from "react";

import SystemStats from "../components/SystemStats";
import useSystemData from "../hooks/useSystemData";
import { useSettings } from "../context/SettingsContext";
import { getSystemStatus } from "../utils/getSystemStatus";
import "./SystemPage.css";
import { API_BASE_URL } from "../config";

function SystemPage() {
  const [systemDetails, setSystemDetails] = useState(null);
  const [detailsError, setDetailsError] = useState("");

  const { systemData, backendOnline, error: liveError } = useSystemData();

  const health = systemData?.health;

  const currentPerformanceWarning =
    health?.frequency_capped_now ||
    health?.throttled_now ||
    health?.soft_temperature_limit_now;

  const previousWarning =
    health?.undervoltage_occurred ||
    health?.frequency_capped_occurred ||
    health?.throttling_occurred ||
    health?.soft_temperature_limit_occurred;

  const { settings } = useSettings();

  const refreshSeconds = settings.systemRefreshInterval / 1000;

  const refreshUnit = refreshSeconds === 1 ? "second" : "seconds";

  const systemStatus = getSystemStatus({
    systemData,
    backendOnline,
    temperatureWarningLimit: settings.temperatureWarningLimit,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSystemDetails() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/system/details`);

        if (!response.ok) {
          throw new Error("The backend returned an error.");
        }

        const data = await response.json();

        if (!cancelled) {
          setSystemDetails(data);
          setDetailsError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setDetailsError(requestError.message);
        }
      }
    }

    loadSystemDetails();

    return () => {
      cancelled = true;
    };
  }, []);

  if (detailsError) {
    return (
      <main className="system-page">
        <h1>System</h1>

        <p className="system-page__error">{detailsError}</p>
      </main>
    );
  }

  if (!systemDetails) {
    return (
      <main className="system-page">
        <h1>System</h1>
        <p>Loading system information...</p>
      </main>
    );
  }

  return (
    <main className="system-page">
      <header className="system-page__header">
        <p className="system-page__eyebrow">Raspberry Pi</p>

        <h1>System Information</h1>

        <p>
          Hardware, operating system and live performance information for this
          Raspberry Pi.
        </p>
      </header>

      <section className="system-details">
        <div className="system-detail">
          <span>Model</span>
          <strong>{systemDetails.model}</strong>
        </div>

        <div className="system-detail">
          <span>Hostname</span>
          <strong>{systemDetails.hostname}</strong>
        </div>

        <div className="system-detail">
          <span>Operating system</span>
          <strong>{systemDetails.operating_system}</strong>
        </div>

        <div className="system-detail">
          <span>Kernel</span>
          <strong>{systemDetails.kernel}</strong>
        </div>

        <div className="system-detail">
          <span>Architecture</span>
          <strong>{systemDetails.architecture}</strong>
        </div>

        <div className="system-detail">
          <span>Physical CPU cores</span>
          <strong>{systemDetails.physical_cpu_cores}</strong>
        </div>

        <div className="system-detail">
          <span>Logical CPU cores</span>
          <strong>{systemDetails.logical_cpu_cores}</strong>
        </div>
      </section>

      <section className="system-live-section">
        <div className="system-live-section__header">
          <div>
            <p className="system-page__eyebrow">Live monitoring</p>

            <h2>Current System Status</h2>
          </div>

          <span className="system-live-section__refresh">
            Refreshed every {refreshSeconds} {refreshUnit}
          </span>
        </div>

        {liveError && <p className="system-page__error">{liveError}</p>}

        <SystemStats systemData={systemData} systemStatus={systemStatus} />

        <div className="system-runtime-details">
          <div className="system-detail">
            <span>Uptime</span>

            <strong>{systemData?.system.uptime ?? "Loading..."}</strong>
          </div>

          <div className="system-detail">
            <span>IP address</span>

            <strong>{systemData?.system.ip_address ?? "Loading..."}</strong>
          </div>

          <div className="system-detail">
            <span>Backend</span>

            <strong>{backendOnline ? "Online" : "Offline"}</strong>
          </div>
        </div>
        <div
          className={`system-health-panel system-health-panel--${
            health?.state ?? "unknown"
          }`}
        >
          <div className="system-health-panel__header">
            <div>
              <span className="system-health-panel__label">
                Raspberry Pi health
              </span>

              <strong>
                {health?.summary ?? "Loading health information..."}
              </strong>
            </div>

            <span className="system-health-panel__state">
              {health?.state ?? "unknown"}
            </span>
          </div>

          <div className="system-health-grid">
            <div
              className={`system-health-item ${
                health?.undervoltage_now ? "system-health-item--warning" : ""
              }`}
            >
              <span>Power supply</span>

              <strong>
                {!health
                  ? "Loading..."
                  : health.undervoltage_now
                  ? "Undervoltage"
                  : "Normal"}
              </strong>
            </div>

            <div
              className={`system-health-item ${
                currentPerformanceWarning ? "system-health-item--warning" : ""
              }`}
            >
              <span>Performance</span>

              <strong>
                {!health
                  ? "Loading..."
                  : currentPerformanceWarning
                  ? "Limited"
                  : "Normal"}
              </strong>
            </div>

            <div
              className={`system-health-item ${
                previousWarning ? "system-health-item--history" : ""
              }`}
            >
              <span>Since boot</span>

              <strong>
                {!health
                  ? "Loading..."
                  : previousWarning
                  ? "Warning recorded"
                  : "No warnings"}
              </strong>
            </div>

            <div className="system-health-item">
              <span>Raw status</span>

              <strong>{health?.raw_value ?? "--"}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SystemPage;
