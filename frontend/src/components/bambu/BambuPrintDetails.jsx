function BambuPrintDetail({ printDetails }) {
  // Temperatures
  const temperatures = printDetails?.temperatures ?? {};

  const nozzleTemperature = temperatures.nozzle ?? "--";
  const nozzleTargetTemperature = temperatures.nozzle_target ?? "--";
  const bedTemperature = temperatures.bed ?? "--";
  const bedTargetTemperature = temperatures.bed_target ?? "--";

  // Layers
  const layers = printDetails?.layers ?? {};

  const currentLayer = layers.current ?? "--";
  const totalLayers = layers.total ?? "--";

  // Print times
  const remainingTimeHours = printDetails?.remaining_time_hours ?? 0;

  const printTime = printDetails?.time ?? {};

  const printStartTime = printTime.start ?? "Unknown";
  const printEndTime = printTime.end ?? "Unknown";

  // Additional print information

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

          <strong className="bambu-detail__value">{currentStage}</strong>
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
    </section>
  );
}
export default BambuPrintDetail;
