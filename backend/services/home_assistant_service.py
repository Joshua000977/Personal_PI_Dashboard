import httpx

from fastapi import HTTPException

from config import (
    HOME_ASSISTANT_TOKEN,
    HOME_ASSISTANT_URL,
)

def parse_number(value: str) -> float | None:
    """Convert a Home Assistant state to a number when possible"""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
    
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

async def call_home_assistant_service(
    domain:str,
    service:str,
    entity_id:str,
    service_data:dict | None=None,
) -> None:
    """Call a Home Assistant service"""
    if not entity_id:
        raise HTTPException(
            status_code=503,
            detail="The Home Assistant entity ID is missing",
        )
    headers={
        "Authorization": f"Bearer {HOME_ASSISTANT_TOKEN}",
        "Content-Type":"application/json",
    }
    payload={
        "entity_id":entity_id,
    }
    if service_data:
        payload.update(service_data)
        
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            f"{HOME_ASSISTANT_URL}/api/services/{domain}/{service}",
            headers=headers,
            json=payload,
        )
    response.raise_for_status()
async def check_home_assistant_status() -> dict:
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