import platform
import socket
import subprocess
import time
import json
import re
import psutil
import httpx
import os

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from urllib import error, request, parse
from dotenv import load_dotenv
from config import FRONTEND_URL

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR /".env")
HOME_ASSISTANT_URL = os.getenv("HOME_ASSISTANT_URL", "").rstrip("/")
HOME_ASSISTANT_TOKEN = os.getenv("HOME_ASSISTANT_TOKEN", "")

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
    