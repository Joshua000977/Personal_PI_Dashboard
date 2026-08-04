import { useEffect, useState } from "react";
const API_URL = `http://${window.location.hostname}:8000/api/home-assistant/bambu-printer`;

export default function useBambuStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBambuStatus() {
      try {
        setError(null);

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Backend returned status ${response.status}`);
        }
        const data = await response.json();
        setStatus(data);
      } catch (requestError) {
        console.error("Failed to load printer status: ", requestError);
        setError(requestError.message);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    }
    loadBambuStatus();
    const intervalId = setInterval(loadBambuStatus,5000 );
    return () => clearInterval(intervalId);
  },[]);
  return{
    status,
    loading,
    error,
  };
}
