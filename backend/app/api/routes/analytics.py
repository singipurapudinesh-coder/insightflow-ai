from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.data_loader import DataLoader
from app.services.analytics_engine import AnalyticsEngine
from app.schemas.analytics import DashboardDataResponse, DatasetProfileResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardDataResponse)
def get_dashboard_metrics(
    region: Optional[str] = Query(None, description="Filter by region (e.g., West, Central)"),
    category: Optional[str] = Query(None, description="Filter by category (e.g., Furniture)"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD")
):
    """
    Returns dynamically computed KPIs, time series, category and regional breakdowns
    from real dataset calculations.
    """
    try:
        df = DataLoader.load_dataset()
        filename = DataLoader.get_current_filename()
        data = AnalyticsEngine.calculate_dashboard_data(
            df=df,
            region=region,
            category=category,
            start_date=start_date,
            end_date=end_date
        )
        data.dataset_name = filename
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate analytics: {str(e)}")

@router.get("/profile", response_model=DatasetProfileResponse)
def get_dataset_profile():
    """Returns data profiling, missing value counts, and quality metrics."""
    try:
        df = DataLoader.load_dataset()
        filename = DataLoader.get_current_filename()
        profile = AnalyticsEngine.profile_dataset(df, filename=filename)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to profile dataset: {str(e)}")

@router.get("/capabilities")
def get_dataset_capabilities():
    """Returns what the user can do with this dataset and suggested questions."""
    try:
        df = DataLoader.load_dataset()
        filename = DataLoader.get_current_filename()
        return AnalyticsEngine.get_dataset_capabilities(df, filename=filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract capabilities: {str(e)}")

@router.post("/generate-chart")
def generate_chart_from_statement(req: dict):
    """
    Dynamically generates chart data and statistical insights based on
    the user's natural language request statement.
    """
    try:
        df = DataLoader.load_dataset()
        query = req.get("query", "")
        chart_type = req.get("chart_type", "auto")
        if not query:
            raise HTTPException(status_code=400, detail="Query statement is required.")
        result = AnalyticsEngine.build_dynamic_chart_from_query(df, query=query, preferred_chart_type=chart_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build chart from statement: {str(e)}")


