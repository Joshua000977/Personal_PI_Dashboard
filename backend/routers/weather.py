
from fastapi import APIRouter

from backend.services.weather_service import fetch_current_weather

router = APIRouter(
    prefix="/api",
    tags=["Weather"],
)

@router.get("/weather")
def get_weather_information(
    location: str = "Straßburg, Kärnten, AT",
):
    return fetch_current_weather(location)