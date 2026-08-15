function BambuFans({ fanDetails = {} }) {
  const chamberFan = fanDetails.chamber ?? {};
  const auxiliaryFan = fanDetails.auxiliary ?? {};
  const coolingFan = fanDetails.cooling ?? {};

  const chamberFanEnabled = chamberFan.enabled ?? false;
  const chamberFanSpeed = chamberFan.speed ?? 0;

  const auxiliaryFanEnabled = auxiliaryFan.enabled ?? false;
  const auxiliaryFanSpeed = auxiliaryFan.speed ?? 0;

  const coolingFanEnabled = coolingFan.enabled ?? false;
  const coolingFanSpeed = coolingFan.speed ?? 0;

  return (
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
  );
}
export default BambuFans;
