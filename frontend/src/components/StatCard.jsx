import "./StatCard.css";

function StatCard({ title, value, detail, icon, progress = 0 }) {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  return (
    <article className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>

      <h3 className="stat-card-value">{value}</h3>

      <p className="stat-card-detail">{detail}</p>

      <div className="stat-card-progress">
        <div
          className="stat-card-progress-fill"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </article>
  );
}

export default StatCard;
