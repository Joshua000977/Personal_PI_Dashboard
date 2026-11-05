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
      <div>
        <h1>
          {now.toLocaleTimeString("de-AT", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </h1>
        <h2>
          {now.toLocaleDateString("de-AT", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </h2>
        <h2>
          {current?.temperature_celsius} °C / Rain:{" "}
          {todayForecast?.precipitation_probability_percent ?? "--"}% /{" "}
          {currentCondition?.label}
        </h2>
        {spotifyData?.is_playing && (
          <div>
            <h2>{track?.name} - {artists}</h2>
          </div>
        )}
      </div>
    </section>
  );
}

export default Screensaver;
