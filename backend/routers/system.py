import platform
import socket
import time

import psutil

from fastapi import APIRouter, BackgroundTasks

from backend.services.system_service import (
    format_uptime,
    get_cpu_temperature,
    get_ip_address,
    get_operating_system,
    get_pi_model,
    get_throttling_status,
    run_power_command,
)
router = APIRouter(
    prefix="/api",
    tags=["System"],
)
@router.get("/system")
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
@router.get("/system/details")
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
@router.get("/storage")
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
    
@router.post("/system/restart", status_code=202)
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


@router.post("/system/shutdown", status_code=202)
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

