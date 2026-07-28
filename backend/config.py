import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIRECTORY = Path(__file__).resolve().parent
ENV_FILE = BACKEND_DIRECTORY / ".env"

load_dotenv(ENV_FILE)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://127.0.0.1:5173",
)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

HOME_ASSISTANT_URL = os.getenv("HOME_ASSISTANT_URL")
HOME_ASSISTANT_TOKEN = os.getenv("HOME_ASSISTANT_TOKEN")

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")