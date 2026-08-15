function BambuPrinterStatus({ printerStatus }) {
  const printStatus = printerStatus?.print_status ?? "Unknown";
  const printProgress = printerStatus?.print_progress ?? 0;
  const taskName = printerStatus?.task_name ?? "Unknown";
  const safeProgress = Math.min(100, Math.max(0, Number(printProgress) || 0));
  // Printer information
  const printer = printerStatus?.printer ?? {};

  const printerName = printer.name ?? "Unknown";
  const wifiSignal = printer.wifi_signal ?? "--";
  const totalUsage = printer.total_usage ?? "--";
  // Printer hardware
  const hardware = printerStatus?.hardware ?? {};

  const bedType = hardware.bed_type ?? "Unknown";
  const nozzleSize = hardware.nozzle_size ?? "--";
  const nozzleType = hardware.nozzle_type ?? "Unknown";

  return (
    <section className="bambu-printer-card">
      <div className="bambu-printer-card__header">
        <div>
          <p className="bambu-printer-card__label">Printer information</p>

          <h2>{printerName}</h2>
        </div>
      </div>
      <p className="bambu-printer-card__header">Current printer Status</p>
      <h2>{printStatus}</h2>

      <div className="bambu-printer-card__details">
        <div className="bambu-detail">
          <span className="bambu-detail__label">Wi-Fi signal</span>

          <strong className="bambu-detail__value">{wifiSignal}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Total usage</span>

          <strong className="bambu-detail__value">{totalUsage} h</strong>
        </div>
      </div>
    </section>
  );
}

export default BambuPrinterStatus;
