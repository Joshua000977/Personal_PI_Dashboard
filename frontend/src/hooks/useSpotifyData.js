import { useEffect, useState } from "react";

const API_URL = `http://${window.location.hostname}:8000/api/spotify`;

export default function useSpotifyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSpotify() {
      try {
        setError(null);

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Backend returend status ${response.status}`);
        }
        const responseData = await response.json();

        setData(responseData);
      } catch (requestError) {
        console.error("failed to load spotify api:", requestError);
        setError(requestError.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadSpotify();

    const intervalId = setInterval(loadSpotify, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    data,
    loading,
    error,
  };
}
