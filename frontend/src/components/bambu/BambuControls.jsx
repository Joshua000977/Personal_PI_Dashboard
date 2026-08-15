import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8000`;
function BambuControls({ controlDetails, chamberLightEnabled }) {
  const [activeControl, setActiveControl] = useState(null);
  const [controlError, setControlError] = useState("");
  const [selectedPrintingSpeed, setSelectedPrintingSpeed] = useState("");

  // Printer controls

  const printingSpeed = controlDetails.printing_speed ?? "Unknown";
  useEffect(() => {
    if (printingSpeed !== "Unknown" && printingSpeed !== "unavailable") {
      setSelectedPrintingSpeed(printingSpeed);
    }
  }, [printingSpeed]);

  const printingSpeedOptions = controlDetails.printing_speed_options ?? [];
  const printingSpeedAvailable = printingSpeed !== "unavailable";

  const pauseAvailable = controlDetails.pause !== "unavailable";

  const resumeAvailable = controlDetails.resume !== "unavailable";

  const stopAvailable = controlDetails.stop !== "unavailable";
  async function runPrinterControl(action) {
    setActiveControl(action);
    setControlError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/home-assistant/bambu-printer/control/${action}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.detail ?? "The printer command failed");
      }
    } catch (error) {
      setControlError(error.message);
    } finally {
      setActiveControl(null);
    }
  }
  async function changePrintingSpeed(event) {
    const selectedSpeed = event.target.value;

    setSelectedPrintingSpeed(selectedSpeed);
    setActiveControl("printing_speed");
    setControlError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/home-assistant/bambu-printer/printing-speed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            option: selectedSpeed,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.detail ?? "Changing the speed failed");
      }
    } catch (error) {
      setControlError(error.message);
      setSelectedPrintingSpeed(printingSpeed);
    } finally {
      setActiveControl(null);
    }
  }
  return (
    <section className="bambu-printer-card">
      <div className="bambu-printer-card__header">
        <div>
          <p className="bambu-printer-card__label">Printer controls</p>

          <h2>Controls</h2>
        </div>
      </div>

      <div className="bambu-printer-card__details">
        <div className="bambu-detail">
          <label className="bambu-detail__label" htmlFor="printing-speed">
            Printing speed
          </label>

          <select
            id="printing-speed"
            value={selectedPrintingSpeed || printingSpeed}
            onChange={changePrintingSpeed}
            disabled={
              activeControl !== null ||
              !printingSpeedAvailable ||
              printingSpeedOptions.length === 0
            }
          >
            {printingSpeedOptions.length === 0 ? (
              <option value={printingSpeed}>{printingSpeed}</option>
            ) : (
              printingSpeedOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Force refresh</span>

          <button
            type="button"
            onClick={() => runPrinterControl("refresh")}
            disabled={activeControl !== null}
          >
            {activeControl === "refresh" ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Pause print</span>

          <button
            type="button"
            onClick={() => runPrinterControl("pause")}
            disabled={activeControl !== null || !pauseAvailable}
          >
            {activeControl === "pause" ? "Pausing..." : "Pause"}
          </button>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Resume print</span>

          <button
            type="button"
            onClick={() => runPrinterControl("resume")}
            disabled={activeControl !== null || !resumeAvailable}
          >
            {activeControl === "resume" ? "Resuming..." : "Resume"}
          </button>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Stop print</span>

          <button
            type="button"
            onClick={() => {
              const shouldStop = window.confirm(
                "Do you really want to stop the current print?"
              );

              if (shouldStop) {
                runPrinterControl("stop");
              }
            }}
            disabled={activeControl !== null || !stopAvailable}
          >
            {activeControl === "stop" ? "Stopping..." : "Stop"}
          </button>
        </div>

        <div className="bambu-detail">
          <span className="bambu-detail__label">Chamber light</span>

          <button
            type="button"
            onClick={() => runPrinterControl("light_toggle")}
            disabled={activeControl !== null}
          >
            {activeControl === "light_toggle"
              ? "Changing..."
              : chamberLightEnabled
              ? "Turn off"
              : "Turn on"}
          </button>
        </div>
      </div>

      {controlError && <p className="bambu-control-error">{controlError}</p>}
    </section>
  );
}
export default BambuControls;
