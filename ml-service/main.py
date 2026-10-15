"""
InsightFlow AI — Machine Learning Microservice (FastAPI)
Provides endpoints for Time-Series Sales Forecasting and Outlier Surveillance.
"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from forecasting import run_forecast
from anomaly import detect_anomalies

app = FastAPI(
    title="InsightFlow AI — ML Service",
    description="Microservice providing Time-Series Forecasting (Prophet/Fourier) and Anomaly Radar.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForecastRequest(BaseModel):
    dates: List[str]
    values: List[float]
    periods: int = 30


class AnomalyRequest(BaseModel):
    values: List[float]
    labels: Optional[List[str]] = None
    sigma: float = 3.0


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "InsightFlow AI ML Engine"}


@app.post("/forecast")
def forecast_endpoint(req: ForecastRequest):
    try:
        results = run_forecast(dates=req.dates, values=req.values, periods=req.periods)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/anomaly")
def anomaly_endpoint(req: AnomalyRequest):
    try:
        results = detect_anomalies(values=req.values, labels=req.labels, sigma=req.sigma)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

