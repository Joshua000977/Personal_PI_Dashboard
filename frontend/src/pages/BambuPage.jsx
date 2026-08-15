import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useBambuStatus from "../hooks/useBambuStatus";
import "./BambuPage.css";
import BambuPrinterStatus from "../components/bambu/BambuPrinterStatusDetails";
import BambuAMS from "../components/bambu/BambuAMSDetails";
import BambuPrintDetails from "../components/bambu/BambuPrintDetails";
import BambuFans from "../components/bambu/BambuFansDetails";
import BambuControls from "../components/bambu/BambuControls";
import BambuFileDetails from "../components/bambu/BambuFileDetails";
import BambuCamera from "../components/bambu/BambuCamera";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8000`;

function formatRemainingTime(hours) {
  const numericHours = Number(hours);
  if (!Number.isFinite(numericHours) || numericHours <= 0) {
    return "--";
  }

  const totalMinutes = Math.round(numericHours * 60);
  const fullHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${fullHours}h ${minutes}m`;
}

function BambuPage() {
  const {
    status: bambuStatus,
    loading: bambuLoading,
    error: bambuError,
  } = useBambuStatus();

  let connectionText = "Checking";
  let connectionDescription = "Checking the Bambu printer connection...";
  let indicatorState = "checking";

  if (bambuLoading) {
    connectionText = "Checking";
    connectionDescription = "Checking the Bambu printer connection...";
    indicatorState = "checking";
  } else if (bambuError || !bambuStatus?.available) {
    connectionText = "Unavailable";
    connectionDescription = "The Bambu printer data could not be loaded.";
    indicatorState = "offline";
  } else if (!bambuStatus.online) {
    connectionText = "Offline";
    connectionDescription = "The Bambu Lab P1S is currently offline.";
    indicatorState = "offline";
  } else {
    connectionText = "Online";
    connectionDescription =
      "The Bambu Lab P1S is online and connected through Home Assistant.";
    indicatorState = "online";
  }



  return (
    <main className="bambu-page">
      <Link to="/applications">← Back to applications</Link>

      <header className="bambu-page__header">
        <p className="bambu-page__eyebrow">3D printer</p>

        <h1>Bambu Lab P1S</h1>

        <p>Monitor the current printer connection and print information.</p>
      </header>

      <section className="bambu-connection-card">
        <div className="bambu-connection-card__top">
          <span
            className={`bambu-connection-card__indicator bambu-connection-card__indicator--${indicatorState}`}
          />

          <div>
            <p className="bambu-connection-card__label">Printer connection</p>

            <h2>{connectionText}</h2>
          </div>
        </div>

        <p className="bambu-connection-card__description">
          {connectionDescription}
        </p>
      </section>

      {!bambuLoading &&
        !bambuError &&
        bambuStatus?.available &&
        bambuStatus?.online && (
          <>
            <BambuPrinterStatus printerStatus={bambuStatus} />
            <BambuAMS
              amsDetails={bambuStatus.ams}
              externalSpoolDetails={bambuStatus.external_spool}
            />
            <BambuPrintDetails printDetails={bambuStatus.print_details} />
            <BambuFans fanDetails={bambuStatus.fans} />
            <BambuControls
              controlDetails={bambuStatus.controls}
              chamberLightEnabled={bambuStatus?.lights?.chamber ?? false}
            />
            <BambuFileDetails fileDetails={bambuStatus?.files ?? {}} />
            <BambuCamera cameraDetails={bambuStatus?.camera ?? {}}/>
          </>
        )}
    </main>
  );
}

export default BambuPage;
