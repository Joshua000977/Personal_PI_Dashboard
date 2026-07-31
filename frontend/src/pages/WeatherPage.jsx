import { Link } from "react-router-dom";

import useWeatherData from "../hooks/useWeatherData";
import "./WeatherPage.css";

function WeatherPage() {
  const {
    weatherData,
    weatherLoading,
    weatherError,
  } = useWeatherData();

  if (weatherLoading) {
    return (
      <main className="weather-page">
        <p>Loading weather...</p>
      </main>
    );
  }

  if (weatherError) {
    return (
      <main className="weather-page">
        <Link to="/applications">
          ← Back to applications
        </Link>

        <h1>Weather unavailable</h1>
        <p>{weatherError}</p>
      </main>
    );
  }

  const location = weatherData?.location;
  const current = weatherData?.current;

  return (
    <main className="weather-page">
      <Link to="/applications">
        ← Back to applications
      </Link>

      <header>
        <p>Current weather</p>

        <h1>{location?.name ?? "Unknown location"}</h1>

        <p>
          {location?.country ?? ""}
        </p>
      </header>

      <section>
        <h2>
          {current?.temperature_celsius ?? "--"} °C
        </h2>

        <p>
          Feels like{" "}
          {current?.apparent_temperature_celsius ?? "--"} °C
        </p>

        <p>
          Humidity: {current?.humidity_percent ?? "--"}%
        </p>

        <p>
          Wind: {current?.wind_speed_kmh ?? "--"} km/h
        </p>

        <p>
          Precipitation:{" "}
          {current?.precipitation_mm ?? "--"} mm
        </p>
      </section>
    </main>
  );
}

export default WeatherPage;