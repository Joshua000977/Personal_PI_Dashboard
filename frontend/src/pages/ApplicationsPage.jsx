import ApplicationTile from "../components/ApplicationTile";
import applications from "../data/applications";
import "./ApplicationsPage.css";


function ApplicationsPage() {
  return (
    <main className="applications-page">
      <header className="applications-page__header">
        <p className="applications-page__eyebrow">
          Control center
        </p>

        <h1>Applications</h1>

        <p>
          Open connected services, devices and personal
          projects.
        </p>
      </header>

      <section className="applications-grid">
        {applications.map((application) => (
          <ApplicationTile
            application={application}
            key={application.id}
          />
        ))}
      </section>
    </main>
  );
}


export default ApplicationsPage;