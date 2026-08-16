import asyncio

import httpx

from fastapi import HTTPException

from config import (
    HOME_ASSISTANT_TOKEN,
    BAMBU_ONLINE_ENTITY,
    BAMBU_PRINT_STATUS_ENTITY,
    BAMBU_AMS_ACTIVE_TRAY_ENTITY,
    BAMBU_AMS_HUMIDITY_ENTITY,
    BAMBU_AMS_HUMIDITY_INDEX_ENTITY,
    BAMBU_AMS_ONLINE_ENTITY,
    BAMBU_AMS_TEMPERATURE_ENTITY,
    BAMBU_AMS_TRAY1_ENTITY,
    BAMBU_AMS_TRAY2_ENTITY,
    BAMBU_AMS_TRAY3_ENTITY,
    BAMBU_AMS_TRAY4_ENTITY,
    BAMBU_AUX_FAN_ENTITY,
    BAMBU_AUX_FAN_SPEED_ENTITY,
    BAMBU_BED_TARGET_TEMPERATURE_ENTITY,
    BAMBU_BED_TEMPERATURE_ENTITY,
    BAMBU_CAMERA_ENTITY,
    BAMBU_CAMERA_SWITCH_ENTITY,
    BAMBU_CHAMBER_FAN_ENTITY,
    BAMBU_CHAMBER_FAN_SPEED_ENTITY,
    BAMBU_CHAMBER_LIGHT_ENTITY,
    BAMBU_COOLING_FAN_ENTITY,
    BAMBU_COOLING_FAN_SPEED_ENTITY,
    BAMBU_COVER_IMAGE_ENTITY    ,
    BAMBU_CURRENT_LAYER_ENTITY,
    BAMBU_CURRENT_STAGE_ENTITY,
    BAMBU_EXTERNAL_SPOOL_ACTIVE_ENTITY,
    BAMBU_EXTERNAL_SPOOL_FILAMENT_ENTITY,
    BAMBU_MODEL_ENTITY,
    BAMBU_EXTRUDER_FILAMENT_ENTITY,
    BAMBU_END_TIME_ENTITY,
    BAMBU_GCODE_FILE_DOWNLOAD_ENTITY,
    BAMBU_ERROR_ENTITY,
    BAMBU_FORCE_REFRESH_ENTITY,
    BAMBU_GCODE_FILE_NAME_ENTITY,
    BAMBU_IMAGE_SENSOR_CAMERA_SWITCH_ENTITY,
    BAMBU_NOZZLE_SIZE_ENTITY,
    BAMBU_NOZZLE_TARGET_TEMPERATURE_ENTITY,
    BAMBU_NOZZLE_TEMPERATURE_ENTITY,
    BAMBU_NOZZLE_TYPE_ENTITY,
    BAMBU_WIFI_SIGNAL_ENTITY,
    BAMBU_PAUSE_ENTITY,
    BAMBU_PRINT_BED_TYPE_ENTITY,
    BAMBU_PRINTABLE_OBJECTS_ENTITY,
    BAMBU_PRINT_LENGTH_ENTITY,
    BAMBU_PRINTER_NAME_ENTITY,
    BAMBU_PRINT_PROGRESS_ENTITY,
    BAMBU_PRINT_TYPE_ENTITY,
    BAMBU_REMAINING_TIME_ENTITY,
    BAMBU_START_TIME_ENTITY,
    BAMBU_TASK_NAME_ENTITY,
    BAMBU_TOTAL_LAYER_COUNT_ENTITY,
    BAMBU_PRINT_WEIGHT_ENTITY,
    BAMBU_PRINTING_SPEED_ENTITY,
    BAMBU_TOTAL_USAGE_ENTITY,
    BAMBU_RESUME_ENTITY,
    BAMBU_STOP_ENTITY,
)

from services.home_assistantService import (
    call_home_assistant_service,
    get_home_assistant_entity,
)

def parse_number(value: str) -> float | None:
    """Convert a Home Assistant state to a number when possible"""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

async def get_bambu_status():
    """Return basic Bambu Lab printer information."""

    entity_ids = {
        "online":BAMBU_ONLINE_ENTITY,
        "print_status":BAMBU_PRINT_STATUS_ENTITY,
        "nozzle_temperature":BAMBU_NOZZLE_TEMPERATURE_ENTITY,
        "print_progress":BAMBU_PRINT_PROGRESS_ENTITY,
        "bed_temperature":BAMBU_BED_TEMPERATURE_ENTITY,
        "bed_target_temperature":BAMBU_BED_TARGET_TEMPERATURE_ENTITY,
        "nozzle_target_temperature":BAMBU_NOZZLE_TARGET_TEMPERATURE_ENTITY,
        "current_layer":BAMBU_CURRENT_LAYER_ENTITY,
        "total_layer":BAMBU_TOTAL_LAYER_COUNT_ENTITY,
        "remaining_time":BAMBU_REMAINING_TIME_ENTITY,
        "task_name":BAMBU_TASK_NAME_ENTITY,
        "bed_type":BAMBU_PRINT_BED_TYPE_ENTITY,
        "nozzle_size":BAMBU_NOZZLE_SIZE_ENTITY,
        "nozzly_type":BAMBU_NOZZLE_TYPE_ENTITY,
        "printer_name":BAMBU_PRINTER_NAME_ENTITY,
        "wifi_signal":BAMBU_WIFI_SIGNAL_ENTITY,
        "print_type":BAMBU_PRINT_TYPE_ENTITY,
        "extruder_filament":BAMBU_EXTRUDER_FILAMENT_ENTITY,
        "print_length":BAMBU_PRINT_LENGTH_ENTITY,
        "print_weight":BAMBU_PRINT_WEIGHT_ENTITY,
        "printable_objects":BAMBU_PRINTABLE_OBJECTS_ENTITY,
        "total_usage":BAMBU_TOTAL_USAGE_ENTITY,
        "current_stage":BAMBU_CURRENT_STAGE_ENTITY,
        "end_time":BAMBU_END_TIME_ENTITY,
        "start_time":BAMBU_START_TIME_ENTITY,
        "camera_switch":BAMBU_IMAGE_SENSOR_CAMERA_SWITCH_ENTITY,
        "ams_online":BAMBU_AMS_ONLINE_ENTITY,
        "ams_temperature":BAMBU_AMS_TEMPERATURE_ENTITY,
        "ams_humidity":BAMBU_AMS_HUMIDITY_ENTITY,
        "ams_humidity_index":BAMBU_AMS_HUMIDITY_INDEX_ENTITY,
        "ams_tray1":BAMBU_AMS_TRAY1_ENTITY,
        "ams_tray2":BAMBU_AMS_TRAY2_ENTITY,
        "ams_tray3":BAMBU_AMS_TRAY3_ENTITY,
        "ams_tray4":BAMBU_AMS_TRAY4_ENTITY,
        "ams_active_try":BAMBU_AMS_ACTIVE_TRAY_ENTITY,
        "external_spool":BAMBU_EXTERNAL_SPOOL_ACTIVE_ENTITY,
        "external_spool_filament":BAMBU_EXTERNAL_SPOOL_FILAMENT_ENTITY,
        "print_error":BAMBU_ERROR_ENTITY,
        "chamber_fan":BAMBU_CHAMBER_FAN_ENTITY,
        "aux_fan":BAMBU_AUX_FAN_ENTITY,
        "cooling_fan":BAMBU_COOLING_FAN_ENTITY,
        "chamber_fan_speed":BAMBU_CHAMBER_FAN_SPEED_ENTITY,
        "aux_fan_speed":BAMBU_AUX_FAN_SPEED_ENTITY,
        "cooling_fan_speed":BAMBU_COOLING_FAN_SPEED_ENTITY,
        "chamber_light":BAMBU_CHAMBER_LIGHT_ENTITY,
        "printing_speed":BAMBU_PRINTING_SPEED_ENTITY,
        "force_refresh":BAMBU_FORCE_REFRESH_ENTITY,
        "pause":BAMBU_PAUSE_ENTITY,
        "resume":BAMBU_RESUME_ENTITY,
        "stop":BAMBU_STOP_ENTITY,
        "gcode_file_download":BAMBU_GCODE_FILE_DOWNLOAD_ENTITY,
        "gcode_file_name":BAMBU_GCODE_FILE_NAME_ENTITY,
        "model_file":BAMBU_MODEL_ENTITY,
        
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
            entity_results = await asyncio.gather(
                *[
                    get_home_assistant_entity(
                        client,
                        entity_id,
                        headers,
                    )
                    for entity_id in entity_ids.values()
                ]
            )

        entities = dict(zip(entity_ids.keys(), entity_results))

        return {
            "available": True,
            "online": entities["online"]["state"] == "on",
            "print_status": entities["print_status"]["state"],
            "print_progress": parse_number(
                entities["print_progress"]["state"]
            ),
            "task_name": entities["task_name"]["state"],

            "printer": {
                "name": entities["printer_name"]["state"],
                "wifi_signal": parse_number(
                    entities["wifi_signal"]["state"]
                ),
                "total_usage": parse_number(
                    entities["total_usage"]["state"]
                ),
            },

            "temperatures": {
                "nozzle": parse_number(
                    entities["nozzle_temperature"]["state"]
                ),
                "nozzle_target": parse_number(
                    entities["nozzle_target_temperature"]["state"]
                ),
                "bed": parse_number(
                    entities["bed_temperature"]["state"]
                ),
                "bed_target": parse_number(
                    entities["bed_target_temperature"]["state"]
                ),
            },

            "layers": {
                "current": parse_number(
                    entities["current_layer"]["state"]
                ),
                "total": parse_number(
                    entities["total_layer"]["state"]
                ),
            },

            "remaining_time_hours": parse_number(
                entities["remaining_time"]["state"]
            ),

            "time": {
                "start": entities["start_time"]["state"],
                "end": entities["end_time"]["state"],
            },

            "hardware": {
                "bed_type": entities["bed_type"]["state"],
                "nozzle_size": parse_number(
                    entities["nozzle_size"]["state"]
                ),
                "nozzle_type": entities["nozzly_type"]["state"],
            },

            "print_details": {
                "type": entities["print_type"]["state"],
                "current_stage": entities["current_stage"]["state"],
                "extruder_filament_present":
                    entities["extruder_filament"]["state"] == "on",
                "length": parse_number(
                    entities["print_length"]["state"]
                ),
                "weight": parse_number(
                    entities["print_weight"]["state"]
                ),
                "printable_objects": entities[
                    "printable_objects"
                ]["state"],
                "error": entities["print_error"]["state"] == "on",
            },

            "camera": {
                "enabled": entities["camera_switch"]["state"] == "on",
            },

            "ams": {
                "online": entities["ams_online"]["state"] == "on",
                "temperature": parse_number(
                    entities["ams_temperature"]["state"]
                ),
                "humidity": parse_number(
                    entities["ams_humidity"]["state"]
                ),
                "humidity_index": parse_number(
                    entities["ams_humidity_index"]["state"]
                ),
                "active_tray": entities["ams_active_try"]["state"],
                "trays": {
                    "tray_1": entities["ams_tray1"]["state"],
                    "tray_2": entities["ams_tray2"]["state"],
                    "tray_3": entities["ams_tray3"]["state"],
                    "tray_4": entities["ams_tray4"]["state"],
                },
            },

            "external_spool": {
                "active":
                    entities["external_spool"]["state"] == "on",
                "filament":
                    entities["external_spool_filament"]["state"],
            },

            "fans": {
                "chamber": {
                    "enabled":
                        entities["chamber_fan"]["state"] == "on",
                    "speed": parse_number(
                        entities["chamber_fan_speed"]["state"]
                    ),
                },
                "auxiliary": {
                    "enabled":
                        entities["aux_fan"]["state"] == "on",
                    "speed": parse_number(
                        entities["aux_fan_speed"]["state"]
                    ),
                },
                "cooling": {
                    "enabled":
                        entities["cooling_fan"]["state"] == "on",
                    "speed": parse_number(
                        entities["cooling_fan_speed"]["state"]
                    ),
                },
            },

            "lights": {
                "chamber":
                    entities["chamber_light"]["state"] == "on",
            },

            "controls": {
                "printing_speed":
                    entities["printing_speed"]["state"],
                "printing_speed_options":
                    entities["printing_speed"]
                    .get("attributes", {})
                    .get("options", []),
                "force_refresh":
                    entities["force_refresh"]["state"],
                "pause": entities["pause"]["state"],
                "resume": entities["resume"]["state"],
                "stop": entities["stop"]["state"],
            },

            "files": {
                "gcode_download":
                    entities["gcode_file_download"]["state"],
                "gcode_name":
                    entities["gcode_file_name"]["state"],
                "model": entities["model_file"]["state"],
            },
        }

    except httpx.HTTPError as error:
        return {
            "available": False,
            "online": False,
            "error": str(error),
        }

BAMBU_CONTROL_ACTIONS = {
    "refresh": (
        "button",
        "press",
        BAMBU_FORCE_REFRESH_ENTITY,
    ),
    "pause": (
        "button",
        "press",
        BAMBU_PAUSE_ENTITY,
    ),
    "resume": (
        "button",
        "press",
        BAMBU_RESUME_ENTITY,
    ),
    "stop": (
        "button",
        "press",
        BAMBU_STOP_ENTITY,
    ),
    "light_toggle": (
        "light",
        "toggle",
        BAMBU_CHAMBER_LIGHT_ENTITY,
    ),
}
async def control_bambu_printer(action: str):
    """Run an allowed Bambu printer control action."""

    control = BAMBU_CONTROL_ACTIONS.get(action)

    if not control:
        raise HTTPException(
            status_code=400,
            detail="Unknown Bambu control action",
        )

    domain, service, entity_id = control

    try:
        await call_home_assistant_service(
            domain=domain,
            service=service,
            entity_id=entity_id,
        )

        return {
            "success": True,
            "action": action,
        }

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail="Home Assistant rejected the control action",
        ) from error
    
async def set_bambu_printing_speed(
    option: str,
):
    """Change the Bambu printer speed through Home Assistant."""

    try:
        await call_home_assistant_service(
            domain="select",
            service="select_option",
            entity_id=BAMBU_PRINTING_SPEED_ENTITY,
            service_data={
                "option": option,
            },
        )

        return {
            "success": True,
            "printing_speed": option,
        }

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail="Home Assistant rejected the printing speed",
        ) from error
    