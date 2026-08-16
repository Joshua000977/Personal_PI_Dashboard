import json
import time

import requests

from config import (
    BACKEND_DIRECTORY,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
)


SPOTIFY_TOKEN_FILE = BACKEND_DIRECTORY / ".spotify_tokens.json"

spotify_auth_states: set[str] = set()
def save_spotify_tokens(token_data: dict) -> None:
    """Save Spotify tokens locally on the Raspberry Pi."""

    token_data["expires_at"] = int(time.time()) + token_data["expires_in"]
    SPOTIFY_TOKEN_FILE.write_text(
        json.dumps(token_data, indent=2),
        encoding="utf-8",
    )


def load_spotify_tokens() -> dict | None:
    """Load previously saved Spotify tokens."""

    if not SPOTIFY_TOKEN_FILE.exists():
        return None

    try:
        return json.loads(
            SPOTIFY_TOKEN_FILE.read_text(encoding="utf-8")
        )
    except (json.JSONDecodeError, OSError):
        return None
def refresh_spotify_access_token(token_data: dict) -> dict | None:
    """Refresh an expired Spotify access token."""

    refresh_token = token_data.get("refresh_token")

    if not refresh_token:
        return None

    try:
        response = requests.post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            auth=(
                SPOTIFY_CLIENT_ID,
                SPOTIFY_CLIENT_SECRET,
            ),
            timeout=10,
        )
    except requests.RequestException:
        return None

    if response.status_code != 200:
        return None

    refreshed_tokens = response.json()

    # Spotify usually does not return a new refresh token.
    refreshed_tokens["refresh_token"] = refreshed_tokens.get(
        "refresh_token",
        refresh_token,
    )

    save_spotify_tokens(refreshed_tokens)

    return refreshed_tokens


def get_spotify_access_token() -> str | None:
    """Return a valid Spotify access token."""

    token_data = load_spotify_tokens()

    if not token_data:
        return None

    expires_at = token_data.get("expires_at", 0)

    # Refresh it 60 seconds before it actually expires.
    if time.time() >= expires_at - 60:
        token_data = refresh_spotify_access_token(token_data)

    if not token_data:
        return None

    return token_data.get("access_token")
def send_spotify_player_command(
    endpoint: str,
    method: str,
    params: dict | None = None,
) -> dict:
    """Send a playback command to the active Spotify device."""

    access_token = get_spotify_access_token()

    if not access_token:
        return {
            "success": False,
            "error": "Spotify is not authenticated",
        }

    try:
        response = requests.request(
            method=method,
            url=f"https://api.spotify.com/v1/me/player/{endpoint}",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            params= params,
            timeout=10,
        )
    except requests.RequestException:
        return {
            "success": False,
            "error": "Spotify could not be reached",
        }

    # Successful Spotify player commands normally return 204 No Content.
    if response.ok:
        return {
            "success": True,
            "command": endpoint,
        }

    return {
        "success": False,
        "error": "Spotify rejected the playback command",
        "spotify_status": response.status_code,
    }