function BambuFileDetails({ fileDetails = {} }) {
  // Print and model files

  const gcodeDownload = fileDetails.gcode_download ?? "Unknown";
  const gcodeFileName = fileDetails.gcode_name ?? "Unknown";
  const modelFile = fileDetails.model ?? "Unknown";
  return (
    <section className="bambu-printer-card">
      <p className="bambu-printer-card__header">Files</p>
      <h2>File</h2>

      <div className="bambu-printer-card__details">
        <div className="bambu-detail">
          <span className="bambu-detail__label">GCode File Download</span>

          <strong className="bambu-detail__value">{gcodeDownload}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">GCode File Name</span>

          <strong className="bambu-detail__value">{gcodeFileName}</strong>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Model File</span>

          <strong className="bambu-detail__value">{modelFile}</strong>
        </div>
      </div>
    </section>
  );
}
export default BambuFileDetails;
