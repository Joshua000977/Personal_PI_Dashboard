import platform
import socket
import time
from pathlib import Path

import psutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Personal Pi Dashboard API")

# Allow the React development server to access the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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