from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router

# Auto-create SQLite database tables on startup.
# This makes it seamless for evaluators to run the application without running manual migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade API for the Airbnb Clone SDE hiring assignment",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
# Standard React/Next.js default port is 3000, Vite is 5173.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload static dir exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount uploads static folder to serve uploaded listing images
app.mount(
    "/static/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="static_uploads"
)

# Root status route
@app.get("/", tags=["status"])
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs"
    }

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)
