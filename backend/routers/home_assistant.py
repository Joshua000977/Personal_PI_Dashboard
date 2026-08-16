from fastapi import APIRouter

from backend.services.home_assistant_service import check_home_assistant_status


router = APIRouter(
    prefix="/api/home-assistant",
    tags=["Home Assistant"],
)


@router.get("/status")
async def get_home_assistant_status():
    return await check_home_assistant_status()