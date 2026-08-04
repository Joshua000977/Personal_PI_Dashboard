import ApplicationTile from "../components/ApplicationTile";
import applications from "../data/applications";
import "./ApplicationsPage.css";
import useWeatherData from "../hooks/useWeatherData";
import getWeatherCondition from "../utils/getWeatherCondition";
import useHomeAssistantStatus from "../hooks/useHomeAssistantStatus";

function ApplicationsPage() {
  const { weatherData, weatherLoading, weatherError } = useWeatherData();
  const weatherCondition = getWeatherCondition(
    weatherData?.current?.weather_code
  );
  const weatherTileData = {
    condition: weatherCondition,
    temperature: weatherData?.current?.temperature_celsius,
    apparent_temperature: weatherData?.current?.apparent_temperature_celsius,
    loading: weatherLoading,
    error: weatherError,
  };

  const {
    status: homeAssistantStatus,
    loading: homeAssistantLoading,
    error: homeAssistantError,
  } = useHomeAssistantStatus();
  const homeAssistantTileData = {
    online: homeAssistantStatus?.online ?? false,
    authenticated: homeAssistantStatus?.authenticated ?? false,
    status: homeAssistantStatus?.status ?? null,
    loading: homeAssistantLoading,
    error: homeAssistantError,
  };
  return (
    <main className="applications-page">
      <header className="applications-page__header">
        <p className="applications-page__eyebrow">Control center</p>

        <h1>Applications</h1>

        <p>Open connected services, devices and personal projects.</p>
      </header>

      <section className="applications-grid">
        {applications.map((application) => (
          <ApplicationTile
            key={application.id}
            application={application}
            weather={application.id === "weather" ? weatherTileData : null}
            homeAssistant={
              application.id === "home-assistant" ? homeAssistantTileData : null
            }
          />
        ))}
      </section>
    </main>
  );
}

export default ApplicationsPage;
