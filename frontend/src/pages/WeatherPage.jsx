import { Link } from "react-router-dom";

import useWeatherData from "../hooks/useWeatherData";
import "./WeatherPage.css";
import getDominantDayCondition from "../utils/getDominantDayCondition";

function formatForecastDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}
function formatTime(dateTimeString) {
  if (!dateTimeString) {
    return "--:--";
  }

  return dateTimeString.split("T")[1].slice(0, 5);
}

function WeatherPage() {
  const { weatherData, weatherLoading, weatherError } = useWeatherData();

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
        <Link to="/applications">← Back to applications</Link>

        <h1>Weather unavailable</h1>
        <p>{weatherError}</p>
      </main>
    );
  }

  const location = weatherData?.location;
  const current = weatherData?.current;

  const forecast = (weatherData?.forecast ?? []).slice(1, 8);
  const hourlyForecast = weatherData?.hourly_forecast ?? [];
  const forecastT = weatherData?.forecast ?? [];
  const todayForecast = forecastT[0];
  const currentWeatherCondition = todayForecast
    ? getDominantDayCondition(hourlyForecast, todayForecast.date)
    : {
        label: "Unknown weather",
        theme: "default",
      };

  return (
    <main
      className={`weather-page weather-page--${currentWeatherCondition.theme}`}
    >
      <Link to="/applications">← Back to applications</Link>

      <header>
        <p>Current weather</p>

        <h1>{location?.name ?? "Unknown location"} </h1>
        <h3>{formatForecastDate(todayForecast.date)}</h3>

        <p>{location?.country ?? ""}</p>
      </header>

      <section className="weather-current">
        <div className="weather-current__temperature">
          <span>Current temperature</span>

          <strong>{current?.temperature_celsius ?? "--"} °C</strong>
          <p>possible {currentWeatherCondition.label}</p>
        </div>

        <div className="weather-current__metrics">
          <div className="weather-metric">
            <span>Feels like</span>
            <strong>{current?.apparent_temperature_celsius ?? "--"} °C</strong>
          </div>

          <div className="weather-metric">
            <span>Today high</span>
            <strong>
              {todayForecast?.maximum_temperature_celsius ?? "--"} °C
            </strong>
          </div>

          <div className="weather-metric">
            <span>Today low</span>
            <strong>
              {todayForecast?.minimum_temperature_celsius ?? "--"} °C
            </strong>
          </div>

          <div className="weather-metric">
            <span>Humidity</span>
            <strong>{current?.humidity_percent ?? "--"}%</strong>
          </div>

          <div className="weather-metric">
            <span>Wind</span>
            <strong>{current?.wind_speed_kmh ?? "--"} km/h</strong>
          </div>

          <div className="weather-metric">
            <span>Rain chance</span>
            <strong>
              {todayForecast?.precipitation_probability_percent ?? "--"}%
            </strong>
          </div>

          <div className="weather-metric">
            <span>Sunrise</span>
            <strong>{formatTime(todayForecast?.sunrise)}</strong>
          </div>

          <div className="weather-metric">
            <span>Sunset</span>
            <strong>{formatTime(todayForecast?.sunset)}</strong>
          </div>
        </div>
      </section>
      <section className="weather-forecast">
        <div className="weather-forecast__header">
          <div>
            <p className="weather-forecast__eyebrow">Upcoming weather</p>

            <h2>7-day forecast</h2>
          </div>
        </div>
        <div className="weather-forecast__grid">
          {forecast.map((day) => {
            const dayCondition = getDominantDayCondition(
              hourlyForecast,
              day.date
            );
            return (
              <article
                className={`weather-forecast-card weather-forecast-card--${dayCondition.theme}`}
                key={day.date}
              >
                <h3>{formatForecastDate(day.date)}</h3>

                <div className="weather-forecast-card__temperatures">
                  <strong>{day.maximum_temperature_celsius ?? "--"}°</strong>

                  <span>{day.minimum_temperature_celsius ?? "--"}°</span>
                </div>

                <div className="weather-forecast-card__details">
                  <p>possible {dayCondition.label} </p>
                  <p>
                    Rain chance
                    <strong>
                      {day.precipitation_probability_percent ?? "--"}%
                    </strong>
                  </p>

                  <p>
                    Precipitation
                    <strong>{day.precipitation_mm ?? "--"} mm</strong>
                  </p>

                  <p>
                    Max wind
                    <strong>{day.maximum_wind_speed_kmh ?? "--"} km/h</strong>
                  </p>
                  <p>
                    Sunrise
                    <strong>{formatTime(day.sunrise)}</strong>
                  </p>
                  <p>
                    Sunset
                    <strong>{formatTime(day.sunset)}</strong>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default WeatherPage;
