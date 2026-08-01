import ApplicationTile from "../components/ApplicationTile";
import applications from "../data/applications";
import "./ApplicationsPage.css";
import useWeatherData from "../hooks/useWeatherData";
import getWeatherCondition from "../utils/getWeatherCondition";

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
            application={application}
            weather={application.id === "weather" ? weatherTileData : null}
            key={application.id}
          />
        ))}
      </section>
    </main>
  );
}

export default ApplicationsPage;
