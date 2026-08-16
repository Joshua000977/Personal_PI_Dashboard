import platform
import socket
import subprocess
import time

from pathlib import Path

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
