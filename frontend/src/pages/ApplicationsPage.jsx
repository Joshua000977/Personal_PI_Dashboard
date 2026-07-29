import { useEffect, useState } from "react";

import { API_BASE_URL } from "../config";
import "./ApplicationsPage.css";


const REFRESH_INTERVAL = 5000;


function ApplicationsPage() {
  const [applicationsData, setApplicationsData] =
    useState(null);

  const [applicationsError, setApplicationsError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/applications`,
        );

        if (!response.ok) {
          throw new Error(
            `The backend returned status ${response.status}.`,
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setApplicationsData(data);
          setApplicationsError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setApplicationsError(requestError.message);
        }
      }
    }

    loadApplications();

    const applicationsInterval = window.setInterval(
      loadApplications,
      REFRESH_INTERVAL,
    );

    return () => {
      cancelled = true;

      window.clearInterval(
        applicationsInterval,
      );
    };
  }, []);

  const applications =
    applicationsData?.applications ?? [];

  const summary = applicationsData?.summary;

  return (
    <main className="applications-page">
      <header className="applications-page__header">
        <div>
          <p className="applications-page__eyebrow">
            Raspberry Pi
          </p>

          <h1>Applications</h1>

          <p>
            Monitor the services that power the Personal Pi
            Dashboard.
          </p>
        </div>

        <div className="applications-page__summary">
          <strong>
            {summary
              ? `${summary.online_count} / ${summary.total_count}`
              : "-- / --"}
          </strong>

          <span>Applications online</span>
        </div>
      </header>

      {applicationsError && (
        <p className="applications-page__error">
          {applicationsError}
        </p>
      )}

      <section className="applications-grid">
        {applications.map((application) => (
          <article
            className={`application-card ${
              application.online
                ? "application-card--online"
                : "application-card--offline"
            }`}
            key={application.id}
          >
            <div className="application-card__header">
              <div>
                <span className="application-card__type">
                  {application.type}
                </span>

                <h2>{application.name}</h2>
              </div>

              <span
                className={`application-card__status ${
                  application.online
                    ? "application-card__status--online"
                    : "application-card__status--offline"
                }`}
              >
                {application.status}
              </span>
            </div>

            <p className="application-card__description">
              {application.description}
            </p>

            <div className="application-card__details">
              <div>
                <span>Service ID</span>
                <strong>{application.id}</strong>
              </div>

              <div>
                <span>Port</span>

                <strong>
                  {application.port ?? "Not applicable"}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!applicationsError &&
        applications.length === 0 && (
          <p className="applications-page__loading">
            Loading application information...
          </p>
        )}
    </main>
  );
}


export default ApplicationsPage;