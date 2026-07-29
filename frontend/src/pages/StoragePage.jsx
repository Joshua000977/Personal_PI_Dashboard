import { useEffect, useState } from "react";

import { API_BASE_URL } from "../config";
import "./StoragePage.css";


const REFRESH_INTERVAL = 5000;


function StoragePage() {
  const [storageData, setStorageData] = useState(null);
  const [storageError, setStorageError] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStorageData() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/storage`,
        );

        if (!response.ok) {
          throw new Error(
            `The backend returned status ${response.status}.`,
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setStorageData(data);
          setStorageError("");
          setBackendOnline(true);
        }
      } catch (requestError) {
        if (!cancelled) {
          setStorageError(requestError.message);
          setBackendOnline(false);
        }
      }
    }

    loadStorageData();

    const storageInterval = window.setInterval(
      loadStorageData,
      REFRESH_INTERVAL,
    );

    return () => {
      cancelled = true;
      window.clearInterval(storageInterval);
    };
  }, []);

  const filesystem = storageData?.filesystem;
  const health = storageData?.health;

  const usagePercent = filesystem?.usage_percent ?? 0;

  const safeUsagePercent = Math.min(
    Math.max(usagePercent, 0),
    100,
  );

  return (
    <main className="storage-page">
      <header className="storage-page__header">
        <div>
          <p className="storage-page__eyebrow">
            Raspberry Pi
          </p>

          <h1>Storage</h1>

          <p>
            Monitor available storage space and filesystem
            usage on this Raspberry Pi.
          </p>
        </div>

        <span
          className={`storage-page__backend ${
            backendOnline
              ? "storage-page__backend--online"
              : "storage-page__backend--offline"
          }`}
        >
          {backendOnline ? "Backend online" : "Backend offline"}
        </span>
      </header>

      {storageError && (
        <p className="storage-page__error">
          {storageError}
        </p>
      )}

      <section className="storage-overview">
        <article className="storage-card">
          <span>Total storage</span>

          <strong>
            {filesystem
              ? `${filesystem.total_gb} GB`
              : "-- GB"}
          </strong>

          <p>Complete filesystem capacity</p>
        </article>

        <article className="storage-card">
          <span>Used storage</span>

          <strong>
            {filesystem
              ? `${filesystem.used_gb} GB`
              : "-- GB"}
          </strong>

          <p>
            {filesystem
              ? `${filesystem.usage_percent}% currently used`
              : "Loading storage information"}
          </p>
        </article>

        <article className="storage-card">
          <span>Free storage</span>

          <strong>
            {filesystem
              ? `${filesystem.free_gb} GB`
              : "-- GB"}
          </strong>

          <p>Storage space still available</p>
        </article>

        <article className="storage-card">
          <span>Mount point</span>

          <strong>
            {filesystem?.mount_point ?? "--"}
          </strong>

          <p>Main Raspberry Pi filesystem</p>
        </article>
      </section>

      <section
        className={`storage-health storage-health--${
          health?.state ?? "unknown"
        }`}
      >
        <div className="storage-health__header">
          <div>
            <span>Storage health</span>

            <strong>
              {health?.summary ??
                "Loading storage status..."}
            </strong>
          </div>

          <span className="storage-health__badge">
            {health?.state ?? "unknown"}
          </span>
        </div>

        <div className="storage-health__usage">
          <div className="storage-health__usage-header">
            <span>Filesystem usage</span>

            <strong>
              {filesystem
                ? `${filesystem.usage_percent}%`
                : "--%"}
            </strong>
          </div>

          <div className="storage-health__progress">
            <div
              className="storage-health__progress-fill"
              style={{
                width: `${safeUsagePercent}%`,
              }}
            />
          </div>

          <div className="storage-health__limits">
            <span>Healthy below 75%</span>
            <span>Warning from 75%</span>
            <span>Critical from 90%</span>
          </div>
        </div>
      </section>

      <section className="storage-information">
        <div>
          <span>Refresh interval</span>
          <strong>5 seconds</strong>
        </div>

        <div>
          <span>Filesystem</span>
          <strong>
            {filesystem?.mount_point ?? "Loading..."}
          </strong>
        </div>

        <div>
          <span>Monitoring mode</span>
          <strong>Read only</strong>
        </div>
      </section>
    </main>
  );
}


export default StoragePage;