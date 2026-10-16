from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import time

from app.core.config import settings
from app.schemas.health import HealthCheckResponse
from app.services.data_loader import DataLoader

# Import API routers
from app.api.routes.analytics import router as analytics_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.copilot import router as copilot_router
from app.api.routes.forecasts import router as forecasts_router
from app.api.routes.reports import router as reports_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade analytics and AI copilot backend engine for InsightFlow AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup
origins = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local development and Vercel preview environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

@app.get("/api/health", response_model=HealthCheckResponse, tags=["health"])
def health_check():
    """
    Core health-check endpoint required by Milestone 1.
    Verifies API readiness, environment info, and sample dataset availability.
    """
    is_sample_ready = DataLoader.is_sample_data_available()
    return HealthCheckResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        sample_data_ready=is_sample_ready,
        details={
            "database": "supabase_configured" if settings.SUPABASE_URL else "local_memory",
            "llm_provider": "gemini" if settings.LLM_API_KEY else "heuristic_fallback",
            "cors_configured": True
        }
    )

@app.get("/", tags=["root"])
def root_redirect():
    return {
        "message": "Welcome to InsightFlow AI Analytics Engine",
        "documentation": "/docs",
        "health": "/api/health"
    }

# Register Routers under /api
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(datasets_router, prefix=settings.API_V1_PREFIX)
app.include_router(copilot_router, prefix=settings.API_V1_PREFIX)
app.include_router(forecasts_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
