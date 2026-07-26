function StatCard({ title, value, detail, icon, progress = 0 }) {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  return (
    <article className="card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>

      <h3 className="stat-value">{value}</h3>
      <p className="stat-detail">{detail}</p>

      <div className="progress">
        <div className="progress-fill" style={{ width: `${safeProgress}%` }} />
      </div>
    </article>
  );
}

export default StatCard;
