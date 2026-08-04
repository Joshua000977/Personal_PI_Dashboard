import useGitHubRepositories from "../hooks/useGitHubRepositories";

import "./ProjectsPage.css";

function ProjectsPage() {
  const {
    data: githubData,
    loading: githubLoading,
    error: githubError,
  } = useGitHubRepositories();

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Unknown";
    }

    return new Date(dateValue).toLocaleDateString();
  }

  return (
    <main className="projects-page">
      <Link to="/applications">← Back to applications</Link>

      <header className="projects-page__header">
        <p className="projects-page__eyebrow">GitHub</p>

        <h1>Projects</h1>

        <p>Public software and hardware projects from my GitHub profile.</p>
      </header>

      {githubLoading && (
        <section className="projects-message">
          <h2>Loading projects</h2>
          <p>Retrieving repositories from GitHub...</p>
        </section>
      )}

      {!githubLoading && githubError && (
        <section className="projects-message projects-message--error">
          <h2>GitHub unavailable</h2>
          <p>{githubError}</p>
        </section>
      )}

      {!githubLoading && !githubError && !githubData?.available && (
        <section className="projects-message projects-message--error">
          <h2>Projects unavailable</h2>
          <p>The GitHub repository data could not be loaded.</p>
        </section>
      )}

      {!githubLoading &&
        !githubError &&
        githubData?.available &&
        githubData.repositories.length === 0 && (
          <section className="projects-message">
            <h2>No projects found</h2>
            <p>No public repositories are currently available.</p>
          </section>
        )}

      {!githubLoading &&
        !githubError &&
        githubData?.available &&
        githubData.repositories.length > 0 && (
          <>
            <section className="projects-summary">
              <div>
                <span>GitHub profile</span>
                <strong>{githubData.username}</strong>
              </div>

              <div>
                <span>Public projects</span>
                <strong>{githubData.repository_count}</strong>
              </div>
            </section>

            <section className="projects-grid">
              {githubData.repositories.map((repository) => (
                <a
                  key={repository.name}
                  className="project-card"
                  href={repository.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="project-card__header">
                    <div>
                      <p className="project-card__label">Repository</p>

                      <h2>{repository.name}</h2>
                    </div>

                    <span className="project-card__arrow">↗</span>
                  </div>

                  <p className="project-card__description">
                    {repository.description ??
                      "No repository description available."}
                  </p>

                  <div className="project-card__details">
                    <div>
                      <span>Language</span>
                      <strong>{repository.language ?? "Unknown"}</strong>
                    </div>

                    <div>
                      <span>Stars</span>
                      <strong>{repository.stars}</strong>
                    </div>

                    <div>
                      <span>Forks</span>
                      <strong>{repository.forks}</strong>
                    </div>
                  </div>

                  <div className="project-card__footer">
                    <span>Last push</span>

                    <strong>{formatDate(repository.pushed_at)}</strong>
                  </div>
                </a>
              ))}
            </section>
          </>
        )}
    </main>
  );
}

export default ProjectsPage;
