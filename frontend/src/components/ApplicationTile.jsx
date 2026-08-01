import { Link } from "react-router-dom";

import "./ApplicationTile.css";

function ApplicationTile({ application, weather }) {
  const tileClassName = weather
    ? `application-tile weather-tile weather-tile--${weather.condition.theme}`
    : "application-tile";

  const tileIcon = weather ? weather.condition.icon : application.shortLabel;

  const tileDescription = weather
    ? weather.loading
      ? "Loading weather..."
      : weather.error
      ? "Weather unavailable"
      : `${weather.temperature ?? "--"} °C · Feels like: ${
          weather.apparent_temperature ?? "--"
        } °C · ${weather.condition.label}`
    : application.description;

  const tileStatus = weather
    ? weather.error
      ? "Offline"
      : "Live"
    : application.status;
  return (
    <Link
      className={tileClassName}
      to={`/applications/${application.id}`}
      aria-label={`Open ${application.name}`}
    >
      <div className="application-tile__top">
        <span className="application-tile__icon">{tileIcon}</span>
        <h2>{application.name}</h2>
        <span className="application-tile__arrow">→</span>
      </div>

      <div className="application-tile__content">
        <p>{tileDescription}</p>
      </div>

      <span className="application-tile__status">{tileStatus}</span>
    </Link>
  );
}

export default ApplicationTile;
