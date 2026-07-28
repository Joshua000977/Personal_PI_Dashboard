import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/system";

function useSystemData(refreshInterval = 3000) {
  const [systemData, setSystemData] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSystemData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setSystemData(data);
          setBackendOnline(true);
          setError("");
        }
      } catch (requestError) {
        console.error("Could not load system information:", requestError);

        if (!cancelled) {
          setBackendOnline(false);
          setError(requestError.message);
        }
      }
    };

    loadSystemData();

    const dataInterval = window.setInterval(loadSystemData, refreshInterval);

    return () => {
      cancelled = true;
      window.clearInterval(dataInterval);
    };
  }, [refreshInterval]);

  return {
    systemData,
    backendOnline,
    error,
  };
}

export default useSystemData;
