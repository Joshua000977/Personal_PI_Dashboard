import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Loading...");
  const [device, setDevice] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/status")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        return response.json();
      })
      .then((data) => {
        setStatus(data.status);
        setDevice(data.device);
      })
      .catch((error) => {
        console.error(error);
        setStatus("offline");
      });
  }, []);

  return (
    <main>
      <h1>Pi Dashboard</h1>
      <p>Device: {device || "Unknown"}</p>
      <p>Backend status: {status}</p>
    </main>
  );
}

export default App;