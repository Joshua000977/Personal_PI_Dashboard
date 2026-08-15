import useBambuStatus from "../hooks/useBambuStatus";
import { Link, matchRoutes } from "react-router-dom";

import "./BambuPage.css";

function formatRemainingTime(hours) {
  const numericHours = Number(hours);
  if (!Number.isFinite(numericHours) || numericHours <= 0) {
    return "--";
  }

  const totalMinutes = Math.round(numericHours * 60);
  const fullHours = Math.floor(totalMinutes / 60);
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

  // Main print status
  const printStatus = bambuStatus?.print_status ?? "Unknown";
  const printProgress = bambuStatus?.print_progress ?? 0;
  const taskName = bambuStatus?.task_name ?? "Unknown";

  const safeProgress = Math.min(100, Math.max(0, Number(printProgress) || 0));

  // Printer information
  const printer = bambuStatus?.printer ?? {};

  const printerName = printer.name ?? "Unknown";
  const wifiSignal = printer.wifi_signal ?? "--";
  const totalUsage = printer.total_usage ?? "--";

  // Temperatures
  const temperatures = bambuStatus?.temperatures ?? {};

  const nozzleTemperature = temperatures.nozzle ?? "--";
  const nozzleTargetTemperature = temperatures.nozzle_target ?? "--";
  const bedTemperature = temperatures.bed ?? "--";
  const bedTargetTemperature = temperatures.bed_target ?? "--";

  // Layers
  const layers = bambuStatus?.layers ?? {};

  const currentLayer = layers.current ?? "--";
  const totalLayers = layers.total ?? "--";

  // Print times
  const remainingTimeHours = bambuStatus?.remaining_time_hours ?? 0;

  const printTime = bambuStatus?.time ?? {};

  const printStartTime = printTime.start ?? "Unknown";
  const printEndTime = printTime.end ?? "Unknown";

  // Printer hardware
  const hardware = bambuStatus?.hardware ?? {};

  const bedType = hardware.bed_type ?? "Unknown";
  const nozzleSize = hardware.nozzle_size ?? "--";
  const nozzleType = hardware.nozzle_type ?? "Unknown";

  // Additional print information
  const printDetails = bambuStatus?.print_details ?? {};

  const printType = printDetails.type ?? "Unknown";
  const currentStage = printDetails.current_stage ?? "Unknown";

  const extruderFilamentPresent =
    printDetails.extruder_filament_present ?? false;

  const printLength = printDetails.length ?? "--";
  const printWeight = printDetails.weight ?? "--";
  const printableObjects = printDetails.printable_objects ?? "Unknown";
  const hasPrintError = printDetails.error ?? false;

  // Camera
  const camera = bambuStatus?.camera ?? {};

  const cameraEnabled = camera.enabled ?? false;

  // AMS
  const ams = bambuStatus?.ams ?? {};
  const amsTrays = ams.trays ?? {};

  const amsOnline = ams.online ?? false;
  const amsTemperature = ams.temperature ?? "--";
  const amsHumidity = ams.humidity ?? "--";
  const amsHumidityIndex = ams.humidity_index ?? "--";
  const amsActiveTray = ams.active_tray ?? "Unknown";

  const amsTray1 = amsTrays.tray_1 ?? "Unknown";
  const amsTray2 = amsTrays.tray_2 ?? "Unknown";
  const amsTray3 = amsTrays.tray_3 ?? "Unknown";
  const amsTray4 = amsTrays.tray_4 ?? "Unknown";

  // External spool
  const externalSpool = bambuStatus?.external_spool ?? {};

  const externalSpoolActive = externalSpool.active ?? false;
  const externalSpoolFilament = externalSpool.filament ?? "Unknown";

  // Fans
  const fans = bambuStatus?.fans ?? {};

  const chamberFan = fans.chamber ?? {};
  const auxiliaryFan = fans.auxiliary ?? {};
  const coolingFan = fans.cooling ?? {};

  const chamberFanEnabled = chamberFan.enabled ?? false;
  const chamberFanSpeed = chamberFan.speed ?? 0;

  const auxiliaryFanEnabled = auxiliaryFan.enabled ?? false;
  const auxiliaryFanSpeed = auxiliaryFan.speed ?? 0;

  const coolingFanEnabled = coolingFan.enabled ?? false;
  const coolingFanSpeed = coolingFan.speed ?? 0;

  // Lights
  const lights = bambuStatus?.lights ?? {};

  const chamberLightEnabled = lights.chamber ?? false;

  // Printer controls
  const controls = bambuStatus?.controls ?? {};

  const printingSpeed = controls.printing_speed ?? "Unknown";
  const forceRefreshState = controls.force_refresh ?? "Unknown";
  const pauseState = controls.pause ?? "Unknown";
  const resumeState = controls.resume ?? "Unknown";
  const stopState = controls.stop ?? "Unknown";

  // Print and model files
  const files = bambuStatus?.files ?? {};

  const gcodeDownload = files.gcode_download ?? "Unknown";
  const gcodeFileName = files.gcode_name ?? "Unknown";
  const modelFile = files.model ?? "Unknown";

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
          <>
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
                  <span className="bambu-detail__label">
                    Nozzle temperature
                  </span>

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

                  <strong className="bambu-detail__value">
                    {safeProgress}%
                  </strong>
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
                  <strong>{safeProgress}%</strong>
                </div>

                <div className="bambu-progress__track">
                  <div
                    className="bambu-progress__fill"
                    style={{ width: `${safeProgress}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="bambu-printer-card">
              <div className="bambu-printer-card__header">
                <div>
                  <p className="bambu-printer-card__label">
                    Printer information
                  </p>

                  <h2>{printerName}</h2>
                </div>
              </div>

              <div className="bambu-printer-card__details">
                <div className="bambu-detail">
                  <span className="bambu-detail__label">Printer name</span>

                  <strong className="bambu-detail__value">{printerName}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Wi-Fi signal</span>

                  <strong className="bambu-detail__value">{wifiSignal}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Total usage</span>

                  <strong className="bambu-detail__value">
                    {totalUsage} h
                  </strong>
                </div>
              </div>
            </section>

            <section className="bambu-printer-card">
              <div className="bambu-printer-card__header">
                <div>
                  <p className="bambu-printer-card__label">Current print</p>

                  <h2>Print details</h2>
                </div>
              </div>

              <div className="bambu-printer-card__details">
                <div className="bambu-detail">
                  <span className="bambu-detail__label">Print type</span>

                  <strong className="bambu-detail__value">{printType}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Current stage</span>

                  <strong className="bambu-detail__value">
                    {currentStage}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Filament detected</span>

                  <strong className="bambu-detail__value">
                    {extruderFilamentPresent ? "Yes" : "No"}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Print length</span>

                  <strong className="bambu-detail__value">{printLength}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Print weight</span>

                  <strong className="bambu-detail__value">{printWeight}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Printable objects</span>

                  <strong className="bambu-detail__value">
                    {printableObjects}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Print start</span>

                  <strong className="bambu-detail__value">
                    {printStartTime}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Estimated end</span>

                  <strong className="bambu-detail__value">
                    {printEndTime}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Print error</span>

                  <strong className="bambu-detail__value">
                    {hasPrintError ? "Error detected" : "No error"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="bambu-printer-card">
              <div className="bambu-printer-card__header">
                <div>
                  <p className="bambu-printer-card__label">
                    Automatic Material System
                  </p>

                  <h2>AMS</h2>
                </div>
              </div>

              <div className="bambu-printer-card__details">
                <div className="bambu-detail">
                  <span className="bambu-detail__label">AMS status</span>

                  <strong className="bambu-detail__value">
                    {amsOnline ? "Online" : "Offline"}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Temperature</span>

                  <strong className="bambu-detail__value">
                    {amsTemperature} °C
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Humidity</span>

                  <strong className="bambu-detail__value">
                    {amsHumidity}%
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Humidity index</span>

                  <strong className="bambu-detail__value">
                    {amsHumidityIndex}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Active tray</span>

                  <strong className="bambu-detail__value">
                    {amsActiveTray}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Tray 1</span>

                  <strong className="bambu-detail__value">{amsTray1}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Tray 2</span>

                  <strong className="bambu-detail__value">{amsTray2}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Tray 3</span>

                  <strong className="bambu-detail__value">{amsTray3}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Tray 4</span>

                  <strong className="bambu-detail__value">{amsTray4}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">External spool</span>

                  <strong className="bambu-detail__value">
                    {externalSpoolActive ? "Active" : "Inactive"}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">External filament</span>

                  <strong className="bambu-detail__value">
                    {externalSpoolFilament}
                  </strong>
                </div>
              </div>
            </section>

            <section className="bambu-printer-card">
              <div className="bambu-printer-card__header">
                <div>
                  <p className="bambu-printer-card__label">Cooling system</p>

                  <h2>Fans</h2>
                </div>
              </div>

              <div className="bambu-printer-card__details">
                <div className="bambu-detail">
                  <span className="bambu-detail__label">Chamber fan</span>

                  <strong className="bambu-detail__value">
                    {chamberFanEnabled ? "On" : "Off"} · {chamberFanSpeed}%
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Auxiliary fan</span>

                  <strong className="bambu-detail__value">
                    {auxiliaryFanEnabled ? "On" : "Off"} · {auxiliaryFanSpeed}%
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Cooling fan</span>

                  <strong className="bambu-detail__value">
                    {coolingFanEnabled ? "On" : "Off"} · {coolingFanSpeed}%
                  </strong>
                </div>
              </div>
            </section>

            <section className="bambu-printer-card">
              <div className="bambu-printer-card__header">
                <div>
                  <p className="bambu-printer-card__label">Printer controls</p>

                  <h2>Controls</h2>
                </div>
              </div>

              <div className="bambu-printer-card__details">
                <div className="bambu-detail">
                  <span className="bambu-detail__label">Printing speed</span>

                  <strong className="bambu-detail__value">
                    {printingSpeed}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Force refresh</span>

                  <strong className="bambu-detail__value">
                    {forceRefreshState}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Pause</span>

                  <strong className="bambu-detail__value">{pauseState}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Resume</span>

                  <strong className="bambu-detail__value">{resumeState}</strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Stop</span>

                  <strong className="bambu-detail__value">{stopState}</strong>
                </div>
                <div className="bambu-detail">
                  <span className="bambu-detail__label">Camera</span>

                  <strong className="bambu-detail__value">
                    {cameraEnabled ? "Enabled" : "Disabled"}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Chamber light</span>

                  <strong className="bambu-detail__value">
                    {chamberLightEnabled ? "On" : "Off"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="bambu-printer-card">
              <div className="bambu-printer-card__header">
                <div>
                  <p className="bambu-printer-card__label">Print files</p>

                  <h2>Files and model</h2>
                </div>
              </div>

              <div className="bambu-printer-card__details">
                <div className="bambu-detail">
                  <span className="bambu-detail__label">G-code filename</span>

                  <strong className="bambu-detail__value">
                    {gcodeFileName}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">G-code download</span>

                  <strong className="bambu-detail__value">
                    {gcodeDownload}
                  </strong>
                </div>

                <div className="bambu-detail">
                  <span className="bambu-detail__label">Model file</span>

                  <strong className="bambu-detail__value">{modelFile}</strong>
                </div>
              </div>
            </section>
          </>
        )}
    </main>
  );
}

export default BambuPage;
