import { useEffect, useState } from "react";
import useWeatherData from "../hooks/useWeatherData";
import getWeatherCondition from "../utils/getWeatherCondition";
import useSpotifyData from "../hooks/useSpotifyData";
import "./Screensaver.css";

function Screensaver({}) {
  const [now, setNow] = useState(() => new Date());

  const { weatherData, weatherLoading, weatherError } = useWeatherData();
  const current = weatherData?.current;
  const forecastT = weatherData?.forecast ?? [];
  const todayForecast = forecastT[0];
  const currentCondition = getWeatherCondition(current?.weather_code);

  const {
    data: spotifyData,
    loading: spotifyLoading,
    error: spotifyError,
  } = useSpotifyData();

  const track = spotifyData?.track;
  const artists = track?.artists?.join(", ") ?? "Unknown artist";
  const duration = track?.duration_ms ?? 0;
  const progress = spotifyData?.progress_ms ?? 0;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="screensaver">
      <div className="screensaver__clock">
        <p className="screensaver__date">
          {now.toLocaleDateString("de-AT", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
  
        <h1 className="screensaver__time">
          {now.toLocaleTimeString("de-AT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </h1>
  
        <div className="screensaver__weather">
          <span className="screensaver__temperature">
            {current?.temperature_celsius != null
              ? `${Math.round(current.temperature_celsius)}°`
              : "--°"}
          </span>
  
          <div className="screensaver__conditions">
            <span>{currentCondition?.label ?? "Weather unavailable"}</span>
            <span className="screensaver__rain">
              Rain probability ·{" "}
              {todayForecast?.precipitation_probability_percent ?? "--"}%
            </span>
          </div>
        </div>
      </div>
  
      {spotifyData?.is_playing && track && (
        <div className="screensaver__spotify">
          <div className="screensaver__music-icon" aria-hidden="true">
            ♪
          </div>
  
          <div className="screensaver__track">
            <p className="screensaver__playing">Now playing on Spotify</p>
            <h2 className="screensaver__song">{track.name}</h2>
            <p className="screensaver__artist">{artists}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Screensaver;
