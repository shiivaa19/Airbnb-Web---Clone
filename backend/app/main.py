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

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.seed import seed_if_empty
    try:
        seed_if_empty()
    except Exception as e:
        print(f"Startup seeding error: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade API for the Airbnb Clone SDE hiring assignment",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
# Allows localhost for local development and all Vercel deployment URLs for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://airbnb-web-clone-azure.vercel.app",
        "https://airbnb-web-clone-git-main-shiivaa19s-projects.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
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
