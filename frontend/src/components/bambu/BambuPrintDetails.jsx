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
function BambuPrintDetail({ printerStatus = {} }) {
  // Main print information
  const taskName = printerStatus.task_name ?? "Unknown";
  const printProgress = printerStatus.print_progress ?? 0;

  const safeProgress = Math.min(100, Math.max(0, Number(printProgress) || 0));

  // Temperatures
  const temperatures = printerStatus.temperatures ?? {};

  const nozzleTemperature = temperatures.nozzle ?? "--";
  const nozzleTargetTemperature = temperatures.nozzle_target ?? "--";
  const bedTemperature = temperatures.bed ?? "--";
  const bedTargetTemperature = temperatures.bed_target ?? "--";

  // Layers
  const layers = printerStatus.layers ?? {};

  const currentLayer = layers.current ?? "--";
  const totalLayers = layers.total ?? "--";

  // Print time
  const remainingTimeHours = printerStatus.remaining_time_hours ?? 0;

  const printTime = printerStatus.time ?? {};

  const printStartTime = printTime.start ?? "Unknown";
  const printEndTime = printTime.end ?? "Unknown";

  // Hardware
  const hardware = printerStatus.hardware ?? {};

  const bedType = hardware.bed_type ?? "Unknown";
  const nozzleSize = hardware.nozzle_size ?? "--";
  const nozzleType = hardware.nozzle_type ?? "Unknown";

  // Additional print information
  const printDetails = printerStatus.print_details ?? {};

  const printType = printDetails.type ?? "Unknown";
  const currentStage = printDetails.current_stage ?? "Unknown";

  const extruderFilamentPresent =
    printDetails.extruder_filament_present ?? false;

  const printLength = printDetails.length ?? "--";
  const printWeight = printDetails.weight ?? "--";
  const printableObjects = printDetails.printable_objects ?? "Unknown";
  const hasPrintError = printDetails.error ?? false;

  return (
    <section className="bambu-printer-card">
      <div className="bambu-printer-card__header">
        <div>
          <p className="bambu-printer-card__label">Current print</p>

          <h2>
            {taskName.toLowerCase() === "unknown"
              ? "No active print"
              : taskName}
          </h2>
        </div>
      </div>

      <div className="bambu-printer-card__details">
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
          <span className="bambu-detail__label">Print type</span>

          <strong className="bambu-detail__value">{printType}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Current stage</span>

          <strong className="bambu-detail__value">{currentStage}</strong>
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

          <strong className="bambu-detail__value">{printableObjects}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Print start</span>

          <strong className="bambu-detail__value">{printStartTime}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Estimated end</span>

          <strong className="bambu-detail__value">{printEndTime}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Print error</span>

          <strong className="bambu-detail__value">
            {hasPrintError ? "Error detected" : "No error"}
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
  );
}
export default BambuPrintDetail;
