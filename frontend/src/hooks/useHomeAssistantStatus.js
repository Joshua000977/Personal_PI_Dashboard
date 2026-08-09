import { useEffect, useState } from "react";

const API_URL =
  `http://${window.location.hostname}:8000/api/home-assistant/status`;

export default function useHomeAssistantStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHomeAssistantStatus() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Backend returned status ${response.status}`,
          );
        }

        const data = await response.json();
        setStatus(data);
      } catch (requestError) {
        console.error(
          "Failed to load Home Assistant status:",
          requestError ,
        ); 

        setError(requestError.message);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    }

    loadHomeAssistantStatus();
  }, []);

  return {
    status,
    loading,
    error,
  };
}