import {
    useSettings,
  } from "../context/SettingsContext";
  
  import "./SettingsPage.css";
  
  
  const SYSTEM_REFRESH_OPTIONS = [
    {
      label: "3 seconds",
      value: 3000,
    },
    {
      label: "5 seconds",
      value: 5000,
    },
    {
      label: "10 seconds",
      value: 10000,
    },
    {
      label: "30 seconds",
      value: 30000,
    },
  ];
  
  
  const STORAGE_REFRESH_OPTIONS = [
    {
      label: "5 seconds",
      value: 5000,
    },
    {
      label: "10 seconds",
      value: 10000,
    },
    {
      label: "30 seconds",
      value: 30000,
    },
    {
      label: "1 minute",
      value: 60000,
    },
  ];
  
  
  function SettingsPage() {
    const {
      settings,
      updateSetting,
      resetSettings,
    } = useSettings();
  
  
    function handleSystemRefreshChange(event) {
      updateSetting(
        "systemRefreshInterval",
        Number(event.target.value),
      );
    }
  
  
    function handleStorageRefreshChange(event) {
      updateSetting(
        "storageRefreshInterval",
        Number(event.target.value),
      );
    }
  
  
    function handleTemperatureLimitChange(event) {
      const newLimit = Number(event.target.value);
  
      updateSetting(
        "temperatureWarningLimit",
        newLimit,
      );
    }
  
  
    return (
      <main className="settings-page">
        <header className="settings-page__header">
          <p className="settings-page__eyebrow">
            Dashboard configuration
          </p>
  
          <h1>Settings</h1>
  
          <p>
            Configure how the Personal Pi Dashboard behaves.
            Changes are saved automatically.
          </p>
        </header>
  
        <section className="settings-section">
          <div className="settings-section__heading">
            <div>
              <h2>Data refresh</h2>
  
              <p>
                Choose how frequently the dashboard requests
                new information from the backend.
              </p>
            </div>
  
            <span className="settings-section__icon">
              ↻
            </span>
          </div>
  
          <div className="settings-list">
            <label
              className="setting-row"
              htmlFor="system-refresh-interval"
            >
              <span className="setting-row__text">
                <strong>System refresh interval</strong>
  
                <small>
                  CPU, memory, temperature and uptime data.
                </small>
              </span>
  
              <select
                id="system-refresh-interval"
                value={settings.systemRefreshInterval}
                onChange={handleSystemRefreshChange}
              >
                {SYSTEM_REFRESH_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
  
            <label
              className="setting-row"
              htmlFor="storage-refresh-interval"
            >
              <span className="setting-row__text">
                <strong>Storage refresh interval</strong>
  
                <small>
                  Disk usage, available space and storage
                  health.
                </small>
              </span>
  
              <select
                id="storage-refresh-interval"
                value={settings.storageRefreshInterval}
                onChange={handleStorageRefreshChange}
              >
                {STORAGE_REFRESH_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
  
        <section className="settings-section">
          <div className="settings-section__heading">
            <div>
              <h2>Temperature</h2>
  
              <p>
                Set the CPU temperature at which the dashboard
                should display a warning.
              </p>
            </div>
  
            <span className="settings-section__icon">
              °C
            </span>
          </div>
  
          <div className="settings-list">
            <label
              className="setting-row"
              htmlFor="temperature-warning-limit"
            >
              <span className="setting-row__text">
                <strong>Warning limit</strong>
  
                <small>
                  Recommended starting value: 70 °C.
                </small>
              </span>
  
              <div className="setting-number-control">
                <input
                  id="temperature-warning-limit"
                  type="number"
                  min="0"
                  max="85"
                  step="1"
                  value={settings.temperatureWarningLimit}
                  onChange={handleTemperatureLimitChange}
                />
  
                <span>°C</span>
              </div>
            </label>
          </div>
        </section>
  
        <section className="settings-section settings-section--reset">
          <div className="settings-section__heading">
            <div>
              <h2>Reset settings</h2>
  
              <p>
                Restore all dashboard preferences to their
                original values.
              </p>
            </div>
          </div>
  
          <button
            className="settings-reset-button"
            type="button"
            onClick={resetSettings}
          >
            Reset to defaults
          </button>
        </section>
      </main>
    );
  }
  
  
  export default SettingsPage;