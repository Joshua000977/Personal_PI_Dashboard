import secrets

import requests

from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from urllib import parse

from backend.services.spotify_service import (
    get_spotify_access_token,
    save_spotify_tokens,
    send_spotify_player_command,
)
from config import (
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
)

SPOTIFY_SCOPES = " ".join(
    [
        "user-read-playback-state",
        "user-read-currently-playing",
        "user-modify-playback-state",
    ]
)
spotify_auth_states: set[str] = set()

router = APIRouter(
    prefix="/api/spotify",
    tags=["Spotify"],
)

#GET
@router.get("/login")
def spotify_login():
    """Redirect the user to Spotify's authorization page."""

    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        return {
            "available": False,
            "error": "Spotify credentials are not configured",
        }

    state = secrets.token_urlsafe(32)
    spotify_auth_states.add(state)

    query_parameters = parse.urlencode(
        {
            "client_id": SPOTIFY_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "scope": SPOTIFY_SCOPES,
            "state": state,
        }
    )

    authorization_url = (
        f"https://accounts.spotify.com/authorize?{query_parameters}"
    )

    return RedirectResponse(authorization_url)


@router.get("/callback")
def spotify_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    """Exchange Spotify's authorization code for access tokens."""

    if error:
        return {
            "authenticated": False,
            "error": error,
        }

    if not state or state not in spotify_auth_states:
        return {
            "authenticated": False,
            "error": "Invalid authorization state",
        }

    spotify_auth_states.remove(state)

    if not code:
        return {
            "authenticated": False,
            "error": "Spotify did not return an authorization code",
        }

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
        },
        auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET),
        timeout=10,
    )

    if response.status_code != 200:
        return {
            "authenticated": False,
            "error": "Could not obtain Spotify tokens",
            "spotify_status": response.status_code,
        }

    save_spotify_tokens(response.json())

    return {
        "authenticated": True,
        "message": "Spotify was connected successfully",
    }     

@router.get("")
def get_spotify_status():
    """Return the user's current Spotify playback information."""

    access_token = get_spotify_access_token()

    if not access_token:
        return {
            "available": True,
            "authenticated": False,
            "is_playing": False,
        }

    try:
        response = requests.get(
            "https://api.spotify.com/v1/me/player",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            timeout=10,
        )
    except requests.RequestException:
        return {
            "available": False,
            "authenticated": True,
            "is_playing": False,
            "error": "Spotify could not be reached",
        }

    # Spotify returns 204 when no device or playback session is active.
    if response.status_code == 204:
        return {
            "available": True,
            "authenticated": True,
            "is_playing": False,
            "track": None,
            "device": None,
        }

    if response.status_code != 200:
        return {
            "available": False,
            "authenticated": True,
            "is_playing": False,
            "error": "Could not retrieve Spotify playback",
            "spotify_status": response.status_code,
        }

    playback = response.json()
    item = playback.get("item")
    device = playback.get("device")

    track = None

    if item:
        album = item.get("album") or {}
        images = album.get("images") or []
        artists = item.get("artists") or []

        track = {
            "name": item.get("name"),
            "artists": [
                artist.get("name")
                for artist in artists
                if artist.get("name")
            ],
            "album": album.get("name"),
            "image_url": images[0].get("url") if images else None,
            "duration_ms": item.get("duration_ms"),
            "spotify_url": (
                item.get("external_urls") or {}
            ).get("spotify"),
        }

    return {
        "available": True,
        "authenticated": True,
        "is_playing": playback.get("is_playing", False),
        "progress_ms": playback.get("progress_ms"),
        "shuffle": playback.get("shuffle_state", False),
        "repeat": playback.get("repeat_state", "off"),
        "track": track,
        "device": {
            "name": device.get("name"),
            "type": device.get("type"),
            "volume_percent": device.get("volume_percent"),
        } if device else None,
    }
#POST
@router.post("/player/previous")
def spotify_previous():
    return send_spotify_player_command("previous", "POST")


@router.post("/player/next")
def spotify_next():
    return send_spotify_player_command("next", "POST")


@router.post("/player/pause")
def spotify_pause():
    return send_spotify_player_command("pause", "PUT")


@router.post("/player/play")
def spotify_play():
    return send_spotify_player_command("play", "PUT")


@router.post("/player/shuffle")
def spotify_shuffle(state: bool):
    return send_spotify_player_command(
        endpoint="shuffle",
        method="PUT",
        params={"state": str(state).lower()},
    )
