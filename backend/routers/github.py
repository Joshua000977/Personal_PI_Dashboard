from fastapi import APIRouter

from backend.services.github_service import fetch_github_repositories

router = APIRouter(
    prefix="/api/github",
    tags=["GitHub"],
)
@router.get("/repositories")
async def get_github_repositories():
   return await fetch_github_repositories()


