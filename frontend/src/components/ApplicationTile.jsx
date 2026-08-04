import { Link } from "react-router-dom";

import "./ApplicationTile.css";

function ApplicationTile({
  application,
  weather,
  homeAssistant,
  bambu,
  github,
}) {
  let tileClassName = "application-tile";
  let tileIcon = application.shortLabel;
  let tileDescription = application.description;
  let tileStatus = application.status;

  // Weather tile
  if (weather) {
    tileClassName = `application-tile weather-tile weather-tile--${weather.condition.theme}`;
    tileIcon = weather.condition.icon;

    if (weather.loading) {
      tileDescription = "Loading weather...";
      tileStatus = "Loading";
    } else if (weather.error) {
      tileDescription = "Weather unavailable";
      tileStatus = "Offline";
    } else {
      tileDescription = `${weather.temperature ?? "--"} °C · Feels like: ${
        weather.apparent_temperature ?? "--"
      } °C · ${weather.condition.label}`;

      tileStatus = "Live";
    }
  }

  // Home Assistant tile
  if (homeAssistant) {
    tileIcon = "HA";

    if (homeAssistant.loading) {
      tileDescription = "Checking Home Assistant connection...";
      tileStatus = "Checking";
    } else if (homeAssistant.error || !homeAssistant.online) {
      tileDescription = "Home Assistant is currently unavailable.";
      tileStatus = "Offline";
    } else if (!homeAssistant.authenticated) {
      tileDescription = "Home Assistant is online, but authentication failed.";
      tileStatus = "Authentication error";
    } else {
      tileDescription = "Home Assistant is online and connected.";
      tileStatus = "Online";
    }
  }
  // Bambu Lab tile
  if (bambu) {
    tileIcon = "3D";

    if (bambu.loading) {
      tileDescription = "Checking Bambu printer connection...";
      tileStatus = "Checking";
    } else if (bambu.error || !bambu.available || !bambu.online) {
      tileDescription = "The Bambu printer is currently unavailable.";
      tileStatus = "Offline";
    } else {
      tileDescription = `Nozzle: ${
        bambu.nozzle_temperature ?? "--"
      } °C · Progress: ${bambu.print_progress ?? "--"} %`;

      tileStatus = bambu.print_status ?? "Online";
    }
  }

  // GitHub projects tile
  if (github) {
    tileIcon = "GH";

    if (github.loading) {
      tileDescription = "Loading GitHub repositories...";
      tileStatus = "Loading";
    } else if (github.error || !github.available) {
      tileDescription = "GitHub repositories are unavailable.";
      tileStatus = "Offline";
    } else {
      const latestRepository = github.repositories[0];

      if (latestRepository) {
        tileDescription = `${
          github.repositoryCount
        } public repositories · Latest: ${latestRepository.name}${
          latestRepository.language ? ` · ${latestRepository.language}` : ""
        }`;
      } else {
        tileDescription = "No public repositories found.";
      }

      tileStatus = "Live";
    }
  }

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
