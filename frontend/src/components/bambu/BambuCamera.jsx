function BambuCamera({ cameraDetails }) {
  const cameraEnabled = cameraDetails.enabled ?? false;
  return(
    <section className="bambu-printer-card">
      <p className="bambu-printer-card__header">Camera</p>
      <h2>{cameraEnabled}</h2>
    </section>
  )
}
export default BambuCamera;
