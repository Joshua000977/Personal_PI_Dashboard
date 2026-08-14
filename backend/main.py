import platform
import socket
import subprocess
import time
import json
import re
import psutil
import httpx
import os
import asyncio
import requests
import secrets

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from urllib import error, request, parse
from dotenv import load_dotenv
from config import FRONTEND_URL
from fastapi.responses import RedirectResponse

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR /".env")

HOME_ASSISTANT_URL = os.getenv("HOME_ASSISTANT_URL", "").rstrip("/")
HOME_ASSISTANT_TOKEN = os.getenv("HOME_ASSISTANT_TOKEN", "")

BAMBU_ONLINE_ENTITY = os.getenv("BAMBU_ONLINE_ENTITY")
BAMBU_PRINT_STATUS_ENTITY = os.getenv("BAMBU_PRINT_STATUS_ENTITY")
BAMBU_NOZZLE_TEMPERATURE_ENTITY = os.getenv("BAMBU_NOZZLE_TEMPERATURE_ENTITY")
BAMBU_PRINT_PROGRESS_ENTITY = os.getenv("BAMBU_PRINT_PROGRESS_ENTITY")
BAMBU_BED_TEMPERATURE_ENTITY = os.getenv(
    "BAMBU_BED_TEMPERATURE_ENTITY"
)
BAMBU_BED_TARGET_TEMPERATURE_ENTITY = os.getenv(
    "BAMBU_BED_TARGET_TEMPERATURE_ENTITY"
)
BAMBU_NOZZLE_TARGET_TEMPERATURE_ENTITY = os.getenv(
    "BAMBU_NOZZLE_TARGET_TEMPERATURE_ENTITY"
)

BAMBU_CURRENT_LAYER_ENTITY = os.getenv(
    "BAMBU_CURRENT_LAYER_ENTITY"
)
BAMBU_TOTAL_LAYER_COUNT_ENTITY = os.getenv(
    "BAMBU_TOTAL_LAYER_COUNT_ENTITY"
)
BAMBU_REMAINING_TIME_ENTITY = os.getenv(
    "BAMBU_REMAINING_TIME_ENTITY"
)
BAMBU_TASK_NAME_ENTITY = os.getenv(
    "BAMBU_TASK_NAME_ENTITY"
)

BAMBU_PRINT_BED_TYPE_ENTITY = os.getenv(
    "BAMBU_PRINT_BED_TYPE_ENTITY"
)
BAMBU_NOZZLE_SIZE_ENTITY = os.getenv(
    "BAMBU_NOZZLE_SIZE_ENTITY"
)
BAMBU_NOZZLE_TYPE_ENTITY = os.getenv(
    "BAMBU_NOZZLE_TYPE_ENTITY"
)

BAMBU_COVER_IMAGE_ENTITY = os.getenv(
    "BAMBU_COVER_IMAGE_ENTITY"
)
BAMBU_CAMERA_ENTITY = os.getenv(
    "BAMBU_CAMERA_ENTITY"
)

GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv(
    "SPOTIFY_REDIRECT_URI",
    "http://127.0.0.1:8000/api/spotify/callback",
)

SPOTIFY_SCOPES = " ".join(
    [
        "user-read-playback-state",
        "user-read-currently-playing",
        "user-modify-playback-state",
    ]
)

SPOTIFY_TOKEN_FILE = Path(__file__).parent / ".spotify_tokens.json"

spotify_auth_states: set[str] = set()

app = FastAPI(title="Personal Pi Dashboard API")


# Allow the React development server to access the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def fetch_json(url: str, service_name: str) -> dict:
    """Request JSON data from an external service."""

    try:
        with request.urlopen(url, timeout=6) as response:
            return json.load(response)

    except (
        error.HTTPError,
        error.URLError,
        TimeoutError,
        json.JSONDecodeError,
    ) as request_error:
        raise HTTPException(
            status_code=503,
            detail=f"{service_name} is currently unavailable",
        ) from request_error
        
"""Home Assistant Bambu helper functions"""
async def get_home_assistant_entity(
    client: httpx.AsyncClient,
    entity_id: str,
    headers: dict,
) ->dict:
    """Load the current state of one Home Assistant entity"""
    response = await client.get(
        f"{HOME_ASSISTANT_URL}/api/states/{entity_id}",
        headers=headers,
    )
    response.raise_for_status()
    return response.json()
def parse_number(value: str) -> float | None:
    """Convert a Home Assistant state to a number when possible"""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
    

 
"""Weather helper functions"""       
def parse_weather_location(location_value: str) -> dict:
    """Split a setting such as 'Strassburg, Kärnten, AT'."""

    cleaned_value = location_value.strip()

    if len(cleaned_value) < 2:
        raise HTTPException(
            status_code=400,
            detail="A valid weather location is required",
        )

    parts = [
        part.strip()
        for part in cleaned_value.split(",")
        if part.strip()
    ]

    country_code = None

    if parts and re.fullmatch(
        r"[A-Za-z]{2}",
        parts[-1],
    ):
        country_code = parts.pop().upper()

    city = parts[0] if parts else None

    region = (
        ", ".join(parts[1:])
        if len(parts) > 1
        else None
    )

    if not city:
        raise HTTPException(
            status_code=400,
            detail="The weather location requires a city",
        )

    return {
        "city": city,
        "region": region,
        "country_code": country_code,
        "original": cleaned_value,
    }

def geocode_location(location_name: str) -> dict:
    """
    Convert a setting such as
    'Strassburg, Kärnten, AT'
    into coordinates.
    """

    cleaned_location = location_name.strip()

    if len(cleaned_location) < 2:
        raise HTTPException(
            status_code=400,
            detail="A valid weather location is required",
        )

    # Split:
    # "Strassburg, Kärnten, AT"
    # into:
    # ["Strassburg", "Kärnten", "AT"]
    location_parts = [
        part.strip()
        for part in cleaned_location.split(",")
        if part.strip()
    ]

    if not location_parts:
        raise HTTPException(
            status_code=400,
            detail="The weather location requires a city",
        )

    country_code = None

    # Check whether the last part is a two-letter
    # country code such as AT, DE or IT.
    if re.fullmatch(
        r"[A-Za-z]{2}",
        location_parts[-1],
    ):
        country_code = location_parts.pop().upper()

    city = location_parts[0]

    region = (
        ", ".join(location_parts[1:])
        if len(location_parts) > 1
        else None
    )

    query_data = {
        "name": city,
        "count": 10,
        "language": "de",
        "format": "json",
    }

    # Add the country filter only when one was entered.
    if country_code:
        query_data["countryCode"] = country_code

    query_parameters = parse.urlencode(
        query_data,
    )

    geocoding_url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?{query_parameters}"
    )

    geocoding_data = fetch_json(
        geocoding_url,
        "Location search",
    )

    results = geocoding_data.get(
        "results",
        [],
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail=(
                f'Location "{cleaned_location}" '
                "was not found"
            ),
        )

    # casefold() also helps compare:
    # Strassburg and Straßburg
    normalized_city = city.casefold()

    normalized_region = (
        region.casefold()
        if region
        else None
    )

    def calculate_match_score(result: dict) -> int:
        score = 0

        result_name = str(
            result.get("name", "")
        ).casefold()

        result_country_code = str(
            result.get("country_code", "")
        ).upper()

        result_region_text = " ".join(
            str(result.get(field, ""))
            for field in [
                "admin1",
                "admin2",
                "admin3",
            ]
        ).casefold()

        # Exact city match is best.
        if result_name == normalized_city:
            score += 10

        # Allow close matches such as names containing
        # extra words.
        elif (
            normalized_city in result_name
            or result_name in normalized_city
        ):
            score += 5

        # Prefer the selected country.
        if country_code:
            if result_country_code == country_code:
                score += 8
            else:
                score -= 20

        # Prefer the selected region, such as Kärnten.
        if (
            normalized_region
            and normalized_region in result_region_text
        ):
            score += 7

        return score

    best_match = max(
        results,
        key=calculate_match_score,
    )

    latitude = best_match.get("latitude")
    longitude = best_match.get("longitude")

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=502,
            detail=(
                "Location service returned "
                "incomplete coordinates"
            ),
        )

    return {
        "name": best_match.get("name"),
        "region": best_match.get("admin1"),
        "district": best_match.get("admin2"),
        "country": best_match.get("country"),
        "country_code": best_match.get(
            "country_code"
        ),
        "latitude": latitude,
        "longitude": longitude,
        "timezone": best_match.get("timezone"),
        "requested_location": cleaned_location,
    }
def fetch_current_weather(location_name: str) -> dict:
    location = geocode_location(location_name)

    query_data = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],

        "current": ",".join([
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "weather_code",
            "wind_speed_10m",
            "precipitation",
            "is_day",
        ]),

        "daily": ",".join([
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "precipitation_sum",
            "wind_speed_10m_max",
            "sunrise",
            "sunset",
        ]),
        "hourly": ",".join([
            "weather_code",
            "precipitation_probability",
        ]),

        "timezone": "auto",
        "forecast_days": 8,
    }

    query_parameters = parse.urlencode(
        query_data,
    )

    weather_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?{query_parameters}"
    )

    weather_data = fetch_json(
        weather_url,
        "Weather service",
    )

    current = weather_data.get(
        "current",
        {},
    )

    daily = weather_data.get(
        "daily",
        {},
    )
    hourly = weather_data.get(
        "hourly",
        {},
    )

    forecast_dates = daily.get(
        "time",
        [],
    )

    def get_daily_value(
        property_name: str,
        index: int,
    ):
        values = daily.get(
            property_name,
            [],
        )

        if index >= len(values):
            return None

        return values[index]
    
    def get_hourly_value(
    property_name: str,
    index: int,
    ):
        values = hourly.get(
            property_name,
            [],
        )

        if index >= len(values):
            return None

        return values[index]

    forecast = []
   

    for index, forecast_date in enumerate(
        forecast_dates
    ):
        forecast.append({
            "date": forecast_date,

            "weather_code": get_daily_value(
                "weather_code",
                index,
            ),

            "maximum_temperature_celsius":
                get_daily_value(
                    "temperature_2m_max",
                    index,
                ),

            "minimum_temperature_celsius":
                get_daily_value(
                    "temperature_2m_min",
                    index,
                ),

            "precipitation_probability_percent":
                get_daily_value(
                    "precipitation_probability_max",
                    index,
                ),

            "precipitation_mm": get_daily_value(
                "precipitation_sum",
                index,
            ),

            "maximum_wind_speed_kmh":
                get_daily_value(
                    "wind_speed_10m_max",
                    index,
                ),

            "sunrise": get_daily_value(
                "sunrise",
                index,
            ),

            "sunset": get_daily_value(
                "sunset",
                index,
            ),
        })
        
    hourly_forecast = []

    for index, forecast_time in enumerate(
        hourly.get("time", [])
    ):
        hourly_forecast.append({
            "time": forecast_time,

            "weather_code": get_hourly_value(
                "weather_code",
                index,
            ),

            "precipitation_probability_percent":
                get_hourly_value(
                    "precipitation_probability",
                    index,
                ),
        })
    
     

    return {
        "location": {
            "name": location.get("name"),
            "region": location.get("region"),
            "country": location.get("country"),
            "country_code": location.get(
                "country_code"
            ),
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
            "timezone": weather_data.get(
                "timezone"
            ),
        },

        "current": {
            "time": current.get("time"),

            "temperature_celsius": current.get(
                "temperature_2m"
            ),

            "apparent_temperature_celsius":
                current.get(
                    "apparent_temperature"
                ),

            "humidity_percent": current.get(
                "relative_humidity_2m"
            ),

            "weather_code": current.get(
                "weather_code"
            ),

            "wind_speed_kmh": current.get(
                "wind_speed_10m"
            ),

            "precipitation_mm": current.get(
                "precipitation"
            ),

            "is_day": current.get(
                "is_day"
            ),
        },

        "forecast": forecast,
        "hourly_forecast": hourly_forecast,
    }
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
"""System helper fuctions"""
def run_power_command(command: str) -> None:
    """Execute an approved Raspberry Pi power command."""

    time.sleep(1)

    subprocess.run(
        [
            "sudo",
            "/usr/bin/systemctl",
            command,
        ],
        check=False,
        timeout=15,
    )

def get_pi_model() -> str:
    """Read the Raspberry Pi model name."""

    model_file = Path("/sys/firmware/devicetree/base/model")

    try:
        return model_file.read_text().strip().replace("\x00", "")
    except (FileNotFoundError, PermissionError):
        return "Unknown device"
    
def get_operating_system() -> str:
    """Read the full operating system name."""

    os_release_file = Path("/etc/os-release")

    try:
        for line in os_release_file.read_text().splitlines():
            if line.startswith("PRETTY_NAME="):
                return line.split("=", 1)[1].strip('"')
    except (FileNotFoundError, PermissionError):
        pass

    return platform.system()

def get_cpu_temperature() -> float | None:
    """Read the Raspberry Pi CPU temperature."""

    thermal_file = Path("/sys/class/thermal/thermal_zone0/temp")

    try:
        temperature_millidegrees = int(thermal_file.read_text().strip())
        return round(temperature_millidegrees / 1000, 1)
    except (FileNotFoundError, PermissionError, ValueError):
        return None

def get_throttling_status() -> dict:
    """Read Raspberry Pi undervoltage and throttling information."""

    unavailable_status = {
        "available": False,
        "raw_value": None,
        "state": "unknown",
        "summary": "Health information unavailable",
        "undervoltage_now": False,
        "frequency_capped_now": False,
        "throttled_now": False,
        "soft_temperature_limit_now": False,
        "undervoltage_occurred": False,
        "frequency_capped_occurred": False,
        "throttling_occurred": False,
        "soft_temperature_limit_occurred": False,
    }

    try:
        result = subprocess.run(
            ["vcgencmd", "get_throttled"],
            capture_output=True,
            text=True,
            timeout=2,
            check=False,
        )
    except (
        FileNotFoundError,
        PermissionError,
        subprocess.TimeoutExpired,
    ):
        return unavailable_status

    if result.returncode != 0:
        return unavailable_status

    try:
        output = result.stdout.strip()
        raw_value = output.split("=", 1)[1]
        status_value = int(raw_value, 16)
    except (IndexError, ValueError):
        return unavailable_status

    undervoltage_now = bool(status_value & (1 << 0))
    frequency_capped_now = bool(status_value & (1 << 1))
    throttled_now = bool(status_value & (1 << 2))
    soft_temperature_limit_now = bool(
        status_value & (1 << 3)
    )

    undervoltage_occurred = bool(status_value & (1 << 16))
    frequency_capped_occurred = bool(
        status_value & (1 << 17)
    )
    throttling_occurred = bool(status_value & (1 << 18))
    soft_temperature_limit_occurred = bool(
        status_value & (1 << 19)
    )

    current_problem = any(
        [
            undervoltage_now,
            frequency_capped_now,
            throttled_now,
            soft_temperature_limit_now,
        ]
    )

    previous_problem = any(
        [
            undervoltage_occurred,
            frequency_capped_occurred,
            throttling_occurred,
            soft_temperature_limit_occurred,
        ]
    )

    if current_problem:
        state = "warning"
        summary = "A system warning is currently active"
    elif previous_problem:
        state = "history"
        summary = "Healthy now, but a warning occurred since boot"
    else:
        state = "healthy"
        summary = "No throttling or undervoltage detected"

    return {
        "available": True,
        "raw_value": raw_value,
        "state": state,
        "summary": summary,
        "undervoltage_now": undervoltage_now,
        "frequency_capped_now": frequency_capped_now,
        "throttled_now": throttled_now,
        "soft_temperature_limit_now": (
            soft_temperature_limit_now
        ),
        "undervoltage_occurred": undervoltage_occurred,
        "frequency_capped_occurred": (
            frequency_capped_occurred
        ),
        "throttling_occurred": throttling_occurred,
        "soft_temperature_limit_occurred": (
            soft_temperature_limit_occurred
        ),
    }

def get_ip_address() -> str:
    """Return the Raspberry Pi's local network address."""

    connection = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    try:
        connection.connect(("8.8.8.8", 80))
        return connection.getsockname()[0]
    except OSError:
        return "Not connected"
    finally:
        connection.close()


def format_uptime(seconds: int) -> str:
    """Convert uptime seconds into a readable string."""

    days, remaining = divmod(seconds, 86400)
    hours, remaining = divmod(remaining, 3600)
    minutes, _ = divmod(remaining, 60)

    if days > 0:
        return f"{days}d {hours}h {minutes}m"

    if hours > 0:
        return f"{hours}h {minutes}m"

    return f"{minutes}m"

def is_http_service_online(url:str) -> bool:
    """Return True when an HTTP service responds"""
    try:
        with request.urlopen(url, timeout=1):
            return True
    except(
        error.URLError,
        TimeoutError,
        ConnectionError,
    ): 
        return False
def is_process_running(search_text: str) -> bool:
    """Check whether a running process contains specific text."""

    search_text = search_text.lower()

    for process in psutil.process_iter(
        ["name", "cmdline"],
    ):
        try:
            process_name = (
                process.info["name"] or ""
            ).lower()

            command_line = " ".join(
                process.info["cmdline"] or [],
            ).lower()

            if (
                search_text in process_name
                or search_text in command_line
            ):
                return True
        except (
            psutil.NoSuchProcess,
            psutil.AccessDenied,
        ):
            continue

    return False

"""API GET"""
@app.get("/")
def read_root():
    return {
        "message": "Personal Pi Dashboard backend is running",
    }


@app.get("/api/system")
def get_system_information():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    uptime_seconds = int(time.time() - psutil.boot_time())

    return {
        "cpu": {
            "usage_percent": psutil.cpu_percent(interval=0.2),
            "cores": psutil.cpu_count(logical=True),
            "temperature_celsius": get_cpu_temperature(),
        },
        "memory": {
            "usage_percent": round(memory.percent, 1),
            "used_gb": round(memory.used / (1024**3), 1),
            "total_gb": round(memory.total / (1024**3), 1),
        },
        "storage": {
            "usage_percent": round(disk.percent, 1),
            "used_gb": round(disk.used / (1024**3), 1),
            "total_gb": round(disk.total / (1024**3), 1),
        },
        "system": {
            "uptime_seconds": uptime_seconds,
            "uptime": format_uptime(uptime_seconds),
            "ip_address": get_ip_address(),
        },
        "health": get_throttling_status(),
    }
@app.get("/api/system/details")
def get_detailed_system_information():
    return {
        "model": get_pi_model(),
        "hostname": socket.gethostname(),
        "operating_system": get_operating_system(),
        "kernel": platform.release(),
        "architecture": platform.machine(),
        "physical_cpu_cores": psutil.cpu_count(logical=False),
        "logical_cpu_cores": psutil.cpu_count(logical=True),
    }
@app.get("/api/storage")
def get_storage_information():
    disk = psutil.disk_usage("/")
    
    storage_state = "healthy"
    storage_summary = "Storage usage is normal"
    
    if disk.percent >= 90:
        storage_state = "critical"
        storage_summary ="Storage is almost full"
    elif disk.percent >= 75:
        storage_state ="warning"
        storage_summary ="Storage space is becoming limited"
    return{
        "filesystem":{
            "mount_point":"/",
            "total_gb": round(disk.total /(1024**3),1),
            "used_gb": round(disk.used / (1024**3),1),
            "free_gb" : round(disk.free /(1024**3),1),
            "usage_percent": round(disk.percent,1),
        },
        "health":{
            "state": storage_state,
            "summary": storage_summary,
        },
    }
    
@app.get("/api/weather")
def get_weather_information(
    location: str = "Straßburg, Kärnten, AT",
):
    return fetch_current_weather(location)


@app.get("/api/home-assistant/status")
async def get_home_assistant_status():
    """Check whether Home Assistant is reachable and authenticated."""

    if not HOME_ASSISTANT_URL or not HOME_ASSISTANT_TOKEN:
        return {
            "online": False,
            "authenticated": False,
            "status": "configuration_missing",
        }

    headers = {
        "Authorization": f"Bearer {HOME_ASSISTANT_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{HOME_ASSISTANT_URL}/api/",
                headers=headers,
            )

        if response.status_code == 200:
            return {
                "online": True,
                "authenticated": True,
                "status": "online",
            }

        if response.status_code in (401, 403):
            return {
                "online": True,
                "authenticated": False,
                "status": "authentication_failed",
            }

        return {
            "online": True,
            "authenticated": False,
            "status": "api_error",
        }

    except httpx.RequestError:
        return {
            "online": False,
            "authenticated": False,
            "status": "unreachable",
        }
        
@app.get("/api/home-assistant/bambu-printer")
async def get_bambu_status():
    """Return basic Bambu Lab printer information."""

    entity_ids = {
        "online":BAMBU_ONLINE_ENTITY,
        "print_status":BAMBU_PRINT_STATUS_ENTITY,
        "nozzle_temp":BAMBU_NOZZLE_TEMPERATURE_ENTITY,
        "print_progress":BAMBU_PRINT_PROGRESS_ENTITY,
        "bed_temp":BAMBU_BED_TEMPERATURE_ENTITY,
        "bed_target_temp":BAMBU_BED_TARGET_TEMPERATURE_ENTITY,
        "nozzle_target_temp":BAMBU_NOZZLE_TARGET_TEMPERATURE_ENTITY,
        "current_layer":BAMBU_CURRENT_LAYER_ENTITY,
        "total_layer":BAMBU_TOTAL_LAYER_COUNT_ENTITY,
        "remaining_time":BAMBU_REMAINING_TIME_ENTITY,
        "task_name":BAMBU_TASK_NAME_ENTITY,
        "bed_type":BAMBU_PRINT_BED_TYPE_ENTITY,
        "nozzle_size":BAMBU_NOZZLE_SIZE_ENTITY,
        "nozzly_type":BAMBU_NOZZLE_TYPE_ENTITY,
    }
    missing_entities =[
        name
        for name, entity_id in entity_ids.items()
        if not entity_id
    ]
    if missing_entities:
        return {
            "available": False,
            "error": "One or more Bambu entity IDs are missing",
            "missing_entities":missing_entities,
        }

    headers = {
        "Authorization": f"Bearer {HOME_ASSISTANT_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            (
                online_entity,
                print_status_entity,
                nozzle_temperature_entity,
                print_progress_entity,
                bed_temperature_entity,
                bed_target_temperature_entity,
                nozzle_target_temperature_entity,
                current_layer_entity,
                total_layer_count_entity,
                remaining_time_entity,
                task_name_entity,
                print_bed_type_entity,
                nozzle_size_entity,
                nozzle_type_entity,
            ) = await asyncio.gather(
                get_home_assistant_entity(
                    client,
                    BAMBU_ONLINE_ENTITY,
                    headers,
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_PRINT_STATUS_ENTITY,
                    headers,
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_NOZZLE_TEMPERATURE_ENTITY,
                    headers,
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_PRINT_PROGRESS_ENTITY,
                    headers,
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_BED_TEMPERATURE_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_BED_TARGET_TEMPERATURE_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_NOZZLE_TARGET_TEMPERATURE_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_CURRENT_LAYER_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_TOTAL_LAYER_COUNT_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_REMAINING_TIME_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_TASK_NAME_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_PRINT_BED_TYPE_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_NOZZLE_SIZE_ENTITY,
                    headers
                ),
                get_home_assistant_entity(
                    client,
                    BAMBU_NOZZLE_TYPE_ENTITY,
                    headers
                ),
            )

        return {
            "available": True,
            "online": online_entity["state"] == "on",
            "print_status": print_status_entity["state"],
            "print_progress": parse_number(
                print_progress_entity["state"]
            ),
            "task_name": task_name_entity["state"],
            "temperatures":{
                "nozzle": parse_number(
                    nozzle_temperature_entity["state"]
                ),
                "nozzle_target": parse_number(
                    nozzle_target_temperature_entity["state"]
                ),
                "bed": parse_number(
                    bed_temperature_entity["state"]
                ),
                "bed_target":parse_number(
                    bed_target_temperature_entity["state"]
                ),
            },
            "layers":{
                "current":parse_number(
                    current_layer_entity["state"]
                ),
                "total":parse_number(
                    total_layer_count_entity["state"]
                ),
            },
            "remaining_time_hours":parse_number(
                remaining_time_entity["state"]
            ),
            "hardware":{
                "bed_type": print_bed_type_entity["state"],
                "nozzle_size":parse_number(
                    nozzle_size_entity["state"]
                ),
                "nozzle_type":nozzle_type_entity["state"],
            },
        }

    except httpx.HTTPError as error:
        return {
            "available": False,
            "online": False,
            "error": str(error),
        }
@app.get("/api/github/repositories")
async def get_github_repositories():
    """Return the user's most recently updated public GitHub repositories."""

    if not GITHUB_USERNAME:
        return {
            "available": False,
            "error": "GitHub username is missing",
            "repositories": [],
        }

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "Personal-Pi-Dashboard",
    }

    params = {
        "type": "owner",
        "sort": "pushed",
        "per_page": 100,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.github.com/users/{GITHUB_USERNAME}/repos",
                headers=headers,
                params=params,
            )

        response.raise_for_status()

        github_repositories = response.json()

        repositories = []

        for repository in github_repositories:
            if repository["fork"] or repository["archived"]:
                continue

            repositories.append(
                {
                    "name": repository["name"],
                    "description": repository["description"],
                    "language": repository["language"],
                    "stars": repository["stargazers_count"],
                    "forks": repository["forks_count"],
                    "updated_at": repository["updated_at"],
                    "pushed_at": repository["pushed_at"],
                    "url": repository["html_url"],
                }
            )

        return {
            "available": True,
            "username": GITHUB_USERNAME,
            "repository_count": len(repositories),
            "repositories": repositories[:6],
        }

    except httpx.HTTPError as error:
        return {
            "available": False,
            "username": GITHUB_USERNAME,
            "error": str(error),
            "repositories": [],
        }  
@app.get("/api/spotify/login")
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


@app.get("/api/spotify/callback")
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

@app.get("/api/spotify")
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


"""API POST"""
@app.post("/api/system/restart", status_code=202)
def restart_raspberry_pi(
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(
        run_power_command,
        "reboot",
    )

    return {
        "accepted": True,
        "action": "restart",
        "message": "Raspberry Pi restart scheduled",
    }


@app.post("/api/system/shutdown", status_code=202)
def shutdown_raspberry_pi(
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(
        run_power_command,
        "poweroff",
    )

    return {
        "accepted": True,
        "action": "shutdown",
        "message": "Raspberry Pi shutdown scheduled",
    }
@app.post("/api/spotify/player/previous")
def spotify_previous():
    return send_spotify_player_command("previous", "POST")


@app.post("/api/spotify/player/next")
def spotify_next():
    return send_spotify_player_command("next", "POST")


@app.post("/api/spotify/player/pause")
def spotify_pause():
    return send_spotify_player_command("pause", "PUT")


@app.post("/api/spotify/player/play")
def spotify_play():
    return send_spotify_player_command("play", "PUT")

@app.post("/api/spotify/player/shuffle")
def spotify_shuffle(state: bool):
    return send_spotify_player_command(
        endpoint="shuffle",
        method="PUT",
        params={"state": str(state).lower()},
    )
    