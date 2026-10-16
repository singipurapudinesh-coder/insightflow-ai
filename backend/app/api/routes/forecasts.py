from fastapi import APIRouter
from app.services.data_loader import DataLoader
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecasts", tags=["forecasts"])

@router.get("/baseline")
def get_baseline_forecast(periods: int = 6):
    """Generates machine-learning sales forecasting based on linear trend analysis."""
    df = DataLoader.load_dataset()
    result = ForecastService.generate_baseline_forecast(df, periods_ahead=periods)
    return result

