import useBambuStatus from "../hooks/useBambuStatus";
import { Link, matchRoutes } from "react-router-dom";

import "./BambuPage.css";

function formatRemainingTime(hours) {
  const numericHours = Number(hours);
  if (!Number.isFinite || numericHours <= 0) {
    return "--";
  }

  const totalMinutes = Math.round(numericHours * 60);
  const fullHours = Math.round(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${fullHours}h ${minutes}m`;
}

function BambuPage() {
  const {
    status: bambuStatus,
    loading: bambuLoading,
    error: bambuError,
  } = useBambuStatus();

  let connectionText = "Checking";
  let connectionDescription = "Checking the Bambu printer connection...";
  let indicatorState = "checking";

  if (bambuLoading) {
    connectionText = "Checking";
    connectionDescription = "Checking the Bambu printer connection...";
    indicatorState = "checking";
  } else if (bambuError || !bambuStatus?.available) {
    connectionText = "Unavailable";
    connectionDescription = "The Bambu printer data could not be loaded.";
    indicatorState = "offline";
  } else if (!bambuStatus.online) {
    connectionText = "Offline";
    connectionDescription = "The Bambu Lab P1S is currently offline.";
    indicatorState = "offline";
  } else {
    connectionText = "Online";
    connectionDescription =
      "The Bambu Lab P1S is online and connected through Home Assistant.";
    indicatorState = "online";
  }

  const printStatus = bambuStatus?.print_status ?? "Unknown";
  const printProgress = bambuStatus?.print_progress ?? 0;
  const taskName = bambuStatus?.task_name ?? "Unknown";

  const temperatures = bambuStatus?.temperatures ?? {};
  const layers = bambuStatus?.layers ?? {};
  const hardware = bambuStatus?.hardware ?? {};

  const nozzleTemperature = temperatures.nozzle ?? "--";
  const nozzleTargetTemperature = temperatures.nozzle_target ?? "--";
  const bedTemperature = temperatures.bed ?? "--";
  const bedTargetTemperature = temperatures.bed_target ?? "--";

  const currentLayer = layers.current ?? "--";
  const totalLayers = layers.total ?? "--";

  const remainingTimeHours = bambuStatus?.remaining_time_hours ?? 0;

  const bedType = hardware.bed_type ?? "Unknown";
  const nozzleSize = hardware.nozzle_size ?? "--";
  const nozzleType = hardware.nozzle_type ?? "Unknown";

  const safeProgress = Math.min(100, Math.max(0, Number(printProgress) || 0));

  return (
    <main className="bambu-page">
      <Link to="/applications">← Back to applications</Link>

      <header className="bambu-page__header">
        <p className="bambu-page__eyebrow">3D printer</p>

        <h1>Bambu Lab P1S</h1>

        <p>Monitor the current printer connection and print information.</p>
      </header>

      <section className="bambu-connection-card">
        <div className="bambu-connection-card__top">
          <span
            className={`bambu-connection-card__indicator bambu-connection-card__indicator--${indicatorState}`}
          />

          <div>
            <p className="bambu-connection-card__label">Printer connection</p>

            <h2>{connectionText}</h2>
          </div>
        </div>

        <p className="bambu-connection-card__description">
          {connectionDescription}
        </p>
      </section>

      {!bambuLoading &&
        !bambuError &&
        bambuStatus?.available &&
        bambuStatus?.online && (
          <section className="bambu-printer-card">
            <div className="bambu-printer-card__header">
              <div>
                <p className="bambu-printer-card__label">
                  Current printer state
                </p>

                <h2>{printStatus}</h2>
                <p>{taskName === "unknown" ? "No active print" : taskName}</p>
              </div>

              <span className="bambu-printer-card__printer-icon">3D</span>
            </div>

            <div className="bambu-printer-card__details">
              <div className="bambu-detail">
                <span className="bambu-detail__label">Print status</span>
                <strong className="bambu-detail__value">{printStatus}</strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Remaining time</span>
                <strong className="bambu-detail__value">
                  {formatRemainingTime(remainingTimeHours)}
                </strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Layer</span>
                <strong className="bambu-detail__value">
                  {currentLayer} / {totalLayers}
                </strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Nozzle temperature</span>
                <strong className="bambu-detail__value">
                  {nozzleTemperature} °C / {nozzleTargetTemperature} °C
                </strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Bed temperature</span>
                <strong className="bambu-detail__value">
                  {bedTemperature} °C / {bedTargetTemperature} °C
                </strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Print progress</span>
                <strong className="bambu-detail__value">{safeProgress}%</strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Print bed</span>
                <strong className="bambu-detail__value">{bedType}</strong>
              </div>

              <div className="bambu-detail">
                <span className="bambu-detail__label">Nozzle</span>
                <strong className="bambu-detail__value">
                  {nozzleSize} mm · {nozzleType}
                </strong>
              </div>
            </div>

            <div className="bambu-progress">
              <div className="bambu-progress__top">
                <span>Print progress</span>
                <strong>{safeProgress} %</strong>
              </div>

              <div className="bambu-progress__track">
                <div
                  className="bambu-progress__fill"
                  style={{ width: `${safeProgress}%` }}
                />
              </div>
            </div>
          </section>
        )}
    </main>
  );
}

export default BambuPage;
