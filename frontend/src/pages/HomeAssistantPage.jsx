import useHomeAssistantStatus from "../hooks/useHomeAssistantStatus";
import "./HomeAssistantPage.css";
import { Link } from "react-router-dom";

function HomeAssistantPage() {
  const { status, loading, error } = useHomeAssistantStatus();

  let statusText = "Checking";
  let description = "Checking Home Assistant connection...";
  let indicatorState = "checking";

  if (error || !status?.online) {
    statusText = "Offline";
    description = "Home Assistant is currently unavailable.";
    indicatorState = "offline";
  } else if (!status?.authenticated) {
    statusText = "Authentication error";
    description = "Home Assistant is online, but authentication failed.";
    indicatorState = "offline";
  } else if (!loading) {
    statusText = "Online";
    description = "Home Assistant is online and connected.";
    indicatorState = "online";
  }

  return (
    <main className="home-assistant-page">
      <Link to="/applications">← Back to applications</Link>

      <header className="home-assistant-page__header">
        <p className="home-assistant-page__eyebrow">Connected service</p>

        <h1>Home Assistant</h1>
      </header>

      <section className="home-assistant-status-card">
        <div className="home-assistant-status-card__top">
          <span
            className={`home-assistant-status-card__indicator home-assistant-status-card__indicator--${indicatorState}`}
          />

          <h2>{statusText}</h2>
        </div>

        <p>{description}</p>
      </section>
    </main>
  );
}

export default HomeAssistantPage;
