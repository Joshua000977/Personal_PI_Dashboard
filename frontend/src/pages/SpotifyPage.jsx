import useSpotifyData from "../hooks/useSpotifyData";
import { Link } from "react-router-dom";
import "./SpotifyPage.css";

function formatTime(milliseconds) {
  if (!milliseconds) {
    return "0:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SpotifyPage() {
  const { data: spotify, loading, error } = useSpotifyData();

  if (loading) {
    return (
      <main className="spotify-page">
        <div className="spotify-page__message">Loading Spotify playback...</div>
      </main>
    );
  }

  if (error || !spotify?.available) {
    return (
      <main className="spotify-page">
        <div className="spotify-page__message spotify-page__message--error">
          Spotify is currently unavailable.
        </div>
      </main>
    );
  }

  if (!spotify.authenticated) {
    return (
      <main className="spotify-page">
        <div className="spotify-page__message">Spotify is not connected.</div>
      </main>
    );
  }

  const track = spotify.track;
  const artists = track?.artists?.join(", ") ?? "Unknown artist";
  const duration = track?.duration_ms ?? 0;
  const progress = spotify.progress_ms ?? 0;

  const progressPercentage =
    duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <main className="spotify-page">
      <Link to="/applications">← Back to applications</Link>
      <header className="spotify-page__header">
        <p className="spotify-page__eyebrow">Connected service</p>

        <h1>Spotify</h1>

        <p className="spotify-page__subtitle">
          Current playback and connected device information.
        </p>
      </header>

      <section className="spotify-player">
        <div>
          {track?.image_url ? (
            <img
              className="spotify-player__cover"
              src={track.image_url}
              alt={`${track.album} album cover`}
            />
          ) : (
            <div className="spotify-player__cover-placeholder">SP</div>
          )}
        </div>

        <div className="spotify-player__information">
          <p className="spotify-player__state">
            {spotify.is_playing ? "Now playing" : "Paused"}
          </p>

          <h2 className="spotify-player__track">
            {track?.name ?? "Nothing playing"}
          </h2>

          <p className="spotify-player__artist">{artists}</p>

          {track?.album && (
            <p className="spotify-player__album">{track.album}</p>
          )}

          <div className="spotify-progress">
            <div className="spotify-progress__bar">
              <div
                className="spotify-progress__fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            <div className="spotify-progress__times">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="spotify-information-grid">
            <div className="spotify-information-card">
              <span className="spotify-information-card__label">Device</span>

              <span className="spotify-information-card__value">
                {spotify.device?.name ?? "No active device"}
              </span>
            </div>

            <div className="spotify-information-card">
              <span className="spotify-information-card__label">Volume</span>

              <span className="spotify-information-card__value">
                {spotify.device?.volume_percent ?? "--"}%
              </span>
            </div>

            <div className="spotify-information-card">
              <span className="spotify-information-card__label">Playback</span>

              <span className="spotify-information-card__value">
                {spotify.shuffle ? "Shuffle" : "Normal"}
                {" · "}
                {spotify.repeat === "off"
                  ? "No repeat"
                  : `Repeat ${spotify.repeat}`}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SpotifyPage;
