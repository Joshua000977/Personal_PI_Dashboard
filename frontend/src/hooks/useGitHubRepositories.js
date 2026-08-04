import { useEffect, useState } from "react";
import { json } from "react-router-dom";

const API_URL = `http://${window.location.hostname}:8000/api/github/repositories`;

export default function useGitHubRepositories() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRepositories() {
      try {
        setError(null);

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Backend returend status${response.status}`);
        }
        const responseData = await response.json();

        setData(responseData);
      } catch (requestError) {
        console.error("failed to load GitHub repositories:", requestError);
        setError(requestError.message);
        setData(null);
      }finally{
        setLoading(false);
      }
    }
    loadRepositories();

    const intervalId = setInterval(loadRepositories, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    data,
    loading,
    error,
  };
}
