import { Link } from "react-router-dom";

import "./ApplicationTile.css";

function ApplicationTile({ application }) {
  return (
    <Link
      className="application-tile"
      to={`/applications/${application.id}`}
      aria-label={`Open ${application.name}`}
    >
      <div className="application-tile__top">
        <span className="application-tile__icon">{application.shortLabel}</span>

        <span className="application-tile__arrow">→</span>
      </div>

      <div className="application-tile__content">
        <h2>{application.name}</h2>

        <p>{application.description}</p>
      </div>

      <span className="application-tile__status">{application.status}</span>
    </Link>
  );
}

export default ApplicationTile;