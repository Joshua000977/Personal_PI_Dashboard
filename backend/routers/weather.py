import json
import re

from urllib import error, parse, request
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/api",
    tags=["Weather"],
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
@router.get("/weather")
def get_weather_information(
    location: str = "Straßburg, Kärnten, AT",
):
    return fetch_current_weather(location)