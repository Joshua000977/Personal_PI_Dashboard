import { useEffect, useState } from "react";

import { API_BASE_URL } from "../config";
import { useSettings } from "../context/SettingsContext";

function useWeatherData() {
  const { settings } = useSettings();

  const location = settings.weatherLocationName;

  const [weatherData, setWeatherData] =
    useState(null);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [weatherError, setWeatherError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      setWeatherLoading(true);

      const query = new URLSearchParams({
        location,
      });

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/weather?${query.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned status ${response.status}`,
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setWeatherData(data);
          setWeatherError("");
        }
      } catch (requestError) {
        console.error(
          "Could not load weather:",
          requestError,
        );

        if (!cancelled) {
          setWeatherError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [location]);

  return {
    weatherData,
    weatherLoading,
    weatherError,
  };
}

export default useWeatherData;