from fastapi import BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from urllib import error, request, parse
from dotenv import load_dotenv
from config import FRONTEND_URL
from fastapi.responses import RedirectResponse

from routers.github import router as github_router
from routers.weather import router as weather_router
from routers.spotify import router as spotify_router
from routers.system import router as system_router
from routers.home_assistant import router as home_assistant_router
from routers.bambu import router as bambu_router

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR /".env")

app = FastAPI(title="Personal Pi Dashboard API")


# Allow the React development server to access the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    
"""API GET"""
@app.get("/")
def read_root():
    return {
        "message": "Personal Pi Dashboard backend is running",
    }

app.include_router(github_router)
app.include_router(spotify_router)
app.include_router(weather_router)
app.include_router(system_router)
app.include_router(home_assistant_router)
app.include_router(bambu_router)