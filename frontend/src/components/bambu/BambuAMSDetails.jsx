function BambuAMS({ amsDetails, externalSpoolDetails }) {

  const amsTrays = amsDetails.trays ?? {};

  const amsOnline = amsDetails.online ?? false;
  const amsTemperature = amsDetails.temperature ?? "--";
  const amsHumidity = amsDetails.humidity ?? "--";
  const amsHumidityIndex = amsDetails.humidity_index ?? "--";
  const amsActiveTray = amsDetails.active_tray ?? "Unknown";

  const amsTray1 = amsTrays.tray_1 ?? "Unknown";
  const amsTray2 = amsTrays.tray_2 ?? "Unknown";
  const amsTray3 = amsTrays.tray_3 ?? "Unknown";
  const amsTray4 = amsTrays.tray_4 ?? "Unknown";
  // External spool

  const externalSpoolActive = externalSpoolDetails.active ?? false;
  const externalSpoolFilament = externalSpoolDetails.filament ?? "Unknown";

  return (
    <section className="bambu-printer-card">
      <div className="bambu-printer-card__header">
        <div>
          <p className="bambu-printer-card__label">Automatic Material System</p>

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

          <strong className="bambu-detail__value">{amsTemperature} °C</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Humidity</span>

          <strong className="bambu-detail__value">{amsHumidity}%</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Humidity index</span>

          <strong className="bambu-detail__value">{amsHumidityIndex}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Active tray</span>

          <strong className="bambu-detail__value">{amsActiveTray}</strong>
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
  );
}

export default BambuAMS;
