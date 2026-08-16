from fastapi import APIRouter
from pydantic import BaseModel

from services import bambuService

router = APIRouter(
    prefix="/api/home-assistant/bambu-printer",
    tags=["Bambu Lab"],
)

class BambuPrintingSpeedRequest(BaseModel):
    option: str


@router.get("")
async def get_bambu_status():
    return await bambuService.get_bambu_status()


@router.post("/control/{action}")
async def control_bambu_printer(action: str):
    return await bambuService.control_bambu_printer(action)


@router.post("/printing-speed")
async def set_bambu_printing_speed(
    request_data: BambuPrintingSpeedRequest,
):
    return await bambuService.set_bambu_printing_speed(
        request_data.option
    )