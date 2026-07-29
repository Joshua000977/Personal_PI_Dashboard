import { Link, useParams } from "react-router-dom";

import { getApplicationById } from "../data/applications";
import "./ApplicationDetailPage.css";


function ApplicationDetailPage() {
  const { applicationId } = useParams();

  const application =
    getApplicationById(applicationId);

  if (!application) {
    return (
      <main className="application-detail-page">
        <Link
          className="application-detail-page__back"
          to="/applications"
        >
          ← Back to applications
        </Link>

        <h1>Application not found</h1>
      </main>
    );
  }

  return (
    <main className="application-detail-page">
      <Link
        className="application-detail-page__back"
        to="/applications"
      >
        ← Back to applications
      </Link>

      <header className="application-detail-page__header">
        <span className="application-detail-page__icon">
          {application.shortLabel}
        </span>

        <div>
          <p className="application-detail-page__eyebrow">
            Application
          </p>

          <h1>{application.name}</h1>

          <p>{application.description}</p>
        </div>
      </header>

      <section className="application-detail-placeholder">
        <span>Integration status</span>

        <strong>{application.status}</strong>

        <p>
          This detail page is ready for the future
          integration.
        </p>
      </section>
    </main>
  );
}


export default ApplicationDetailPage;