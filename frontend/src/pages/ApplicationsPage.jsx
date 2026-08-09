import ApplicationTile from "../components/ApplicationTile";
import applications from "../data/applications";
import "./ApplicationsPage.css";

import useWeatherData from "../hooks/useWeatherData";
import getWeatherCondition from "../utils/getWeatherCondition";
import useHomeAssistantStatus from "../hooks/useHomeAssistantStatus";
import useBambuStatus from "../hooks/useBambuStatus";
import useGitHubRepositories from "../hooks/useGitHubRepositories";
import useSpotifyData from "../hooks/useSpotifyData";

function ApplicationsPage() {
  //Weather hook
  const { weatherData, weatherLoading, weatherError } = useWeatherData();
  const weatherCondition = getWeatherCondition(
    weatherData?.current?.weather_code
  );
  const weatherTileData = {
    condition: weatherCondition,
    temperature: weatherData?.current?.temperature_celsius,
    apparent_temperature: weatherData?.current?.apparent_temperature_celsius,
    loading: weatherLoading,
    error: weatherError,
  };

  //Home Assistant hook
  const {
    status: homeAssistantStatus,
    loading: homeAssistantLoading,
    error: homeAssistantError,
  } = useHomeAssistantStatus();
  const homeAssistantTileData = {
    online: homeAssistantStatus?.online ?? false,
    authenticated: homeAssistantStatus?.authenticated ?? false,
    status: homeAssistantStatus?.status ?? null,
    loading: homeAssistantLoading,
    error: homeAssistantError,
  };
  //Bambu hook
  const {
    status: bambuStatus,
    loading: bambuLoading,
    error: bambuError,
  } = useBambuStatus();
  const bambuTileData = {
    available: bambuStatus?.available ?? false,
    online: bambuStatus?.online ?? false,
    print_status: bambuStatus?.print_status ?? null,
    nozzle_temperature: bambuStatus?.nozzle_temperature ?? null,
    print_progress: bambuStatus?.print_progress ?? null,
    loading: bambuLoading,
    error: bambuError,
  };
  //GitHub hook
  const {
    data: githubData,
    loading: githubLoading,
    error: githubError,
  } = useGitHubRepositories();
  const githubTileData = {
    available: githubData?.available ?? false,
    username: githubData?.username ?? null,
    repositoryCount: githubData?.repository_count ?? 0,
    repositories: githubData?.repositories ?? [],
    loading: githubLoading,
    error: githubError,
  };
  //Spotify hook
  const{
    data: spotifyData,
    loading  : spotifyLoading,
    error: spotifyError,
  }=useSpotifyData();
  const spotifyTileData = {
    available: spotifyData?.available ?? false,
    authenticated: spotifyData?.authenticated ?? false,
    isPlaying: spotifyData?.is_playing ?? false,
    track: spotifyData?.track ?? null,
    device: spotifyData?.device ?? null,
    loading: spotifyLoading,
    error: spotifyError,
  };
  return (
    <main className="applications-page">
      <header className="applications-page__header">
        <p className="applications-page__eyebrow">Control center</p>

        <h1>Applications</h1>

        <p>Open connected services, devices and personal projects.</p>
      </header>

      <section className="applications-grid">
        {applications.map((application) => (
          <ApplicationTile
            key={application.id}
            application={application}
            weather={application.id === "weather" ? weatherTileData : null}
            homeAssistant={
              application.id === "home-assistant" ? homeAssistantTileData : null
            }
            bambu={application.id === "bambu-printer" ? bambuTileData : null}
            github={application.id === "project" ? githubTileData : null}
            spotify={application.id === "spotify" ? spotifyTileData : null}
          />
        ))}
      </section>
    </main>
  );
}

export default ApplicationsPage;
