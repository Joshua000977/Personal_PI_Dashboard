import platform
import socket
import subprocess
import time
from pathlib import Path
from urllib import error, request

import psutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL

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
    
@app.get("/api/applications")
def get_application_statuses():
    frontend_online = is_http_service_online(
        "http://127.0.0.1:5173"
    )
    chromium_online = is_process_running("chromium")
    return {
        "applications": [
            {
                "id": "backend",
                "name": "Dashboard Backend",
                "description": (
                    "FastAPI service providing system data "
                    "to the dashboard."
                ),
                "status": "online",
                "online": True,
                "type": "FastAPI",
                "port": 8000,
            },
            {
                "id": "frontend",
                "name": "Dashboard Frontend",
                "description": (
                    "React interface displayed on the "
                    "Raspberry Pi touchscreen."
                ),
                "status": (
                    "online"
                    if frontend_online
                    else "offline"
                ),
                "online": frontend_online,
                "type": "React / Vite",
                "port": 5173,
            },
            {
                "id": "chromium",
                "name": "Chromium Kiosk",
                "description": (
                    "Fullscreen browser displaying the "
                    "Personal Pi Dashboard."
                ),
                "status": (
                    "online"
                    if chromium_online
                    else "offline"
                ),
                "online": chromium_online,
                "type": "Chromium",
                "port": None,
            },
        ],
        "summary": {
            "online_count": (
                1
                + int(frontend_online)
                + int(chromium_online)
            ),
            "total_count": 3,
        },
    }