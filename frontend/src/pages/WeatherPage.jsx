import { Link } from "react-router-dom";
import { useState } from "react";

import useWeatherData from "../hooks/useWeatherData";
import "./WeatherPage.css";
import getDominantDayCondition from "../utils/getDominantDayCondition";
import getWeatherCondition from "../utils/getWeatherCondition";
import getSevereWeatherWarning from "../utils/getSevereWeatherWarning";
import { useSettings } from "../context/SettingsContext";

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
  const { settings, updateSetting } = useSettings();

  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  const [locationInput, setLocationInput] = useState(
    settings.weatherLocationName ?? ""
  );

  function handleLocationSave(event) {
    event.preventDefault();

    const cleanedLocation = locationInput.trim();

    if (!cleanedLocation) {
      return;
    }

    updateSetting("weatherLocationName", cleanedLocation);

    updateSetting("weatherLocationMode", "manual");

    setIsLocationPopupOpen(false);
  }

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
  const currentCondition = getWeatherCondition(current?.weather_code);

  const todayCondition = todayForecast
    ? getDominantDayCondition(hourlyForecast, todayForecast.date)
    : {
        label: "Unknown weather",
        theme: "default",
      };
  const todaySevereWarning = todayForecast
    ? getSevereWeatherWarning(
        hourlyForecast,
        todayForecast.date,
        todayForecast.precipitation_probability_percent
      )
    : null;

  return (
    <main className={`weather-page weather-page--${todayCondition.theme}`}>
      <Link to="/applications">← Back to applications</Link>

      <header>
        <p>Current weather</p>
        <div className="weather-location-row">
          <h1>{location?.name ?? "Unknown location"}</h1>

          <button
            type="button"
            className="weather-settings-button"
            onClick={() => {
              setLocationInput(settings.weatherLocationName ?? "");

              setIsLocationPopupOpen(true);
            }}
          >
            Change location
          </button>
        </div>
        <p>{location?.region ?? ""}, {location?.country ?? ""}</p>
        <h3>{formatForecastDate(todayForecast.date)}</h3>
      </header>

      <section className="weather-current">
        <div className="weather-current__temperature">
          <span>Current temperature</span>

          <strong>{current?.temperature_celsius ?? "--"} °C</strong>

          <p>{currentCondition.label}</p>
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

          <div
            className={`weather-metric ${
              todaySevereWarning
                ? `weather-warning weather-warning--${todaySevereWarning.theme}`
                : ""
            }`}
          >
            {todaySevereWarning ? (
              <>
                <span>{todaySevereWarning.label}</span>

                <strong>{todaySevereWarning.probabilityPercent}%</strong>
              </>
            ) : (
              <>
                <span>Rain chance</span>

                <strong>
                  {todayForecast?.precipitation_probability_percent ?? "--"}%
                </strong>
              </>
            )}
          </div>

          <div className="weather-metric">
            <span>Wind</span>

            <strong>{current?.wind_speed_kmh ?? "--"} km/h</strong>
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
            const severeWeatherWarning = getSevereWeatherWarning(
              hourlyForecast,
              day.date,
              day.precipitation_probability_percent
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
                  <p className="weather-forecast-card__condition">
                    {dayCondition.label}
                  </p>
                  {severeWeatherWarning ? (
                    <p
                      className={`weather-warning weather-warning--${severeWeatherWarning.theme}`}
                    >
                      <span>{severeWeatherWarning.label}</span>

                      <strong>
                        {severeWeatherWarning.probabilityPercent}%
                      </strong>
                    </p>
                  ) : (
                    <p>
                      Rain chance
                      <strong>
                        {day.precipitation_probability_percent ?? "--"}%
                      </strong>
                    </p>
                  )}

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
      {isLocationPopupOpen && (
        <div
          className="weather-popup-backdrop"
          onMouseDown={() => {
            setIsLocationPopupOpen(false);
          }}
        >
          <form
            className="weather-location-popup"
            onSubmit={handleLocationSave}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <h2>Change weather location</h2>

            <label htmlFor="weather-location-input">Location</label>

            <input
              id="weather-location-input"
              type="text"
              value={locationInput}
              onChange={(event) => {
                setLocationInput(event.target.value);
              }}
              placeholder="Straßburg, Kärnten, AT"
              autoFocus
            />

            <p className="weather-location-popup__hint">
              Enter city, region and country code.
            </p>

            <div className="weather-location-popup__actions">
              <button
                type="button"
                onClick={() => {
                  setIsLocationPopupOpen(false);
                }}
              >
                Cancel
              </button>

              <button type="submit">Save location</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default WeatherPage;
