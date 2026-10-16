from fastapi import APIRouter
from pydantic import BaseModel
from app.services.data_loader import DataLoader
from app.services.ai_service import AIService

from app.services.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/copilot", tags=["copilot"])

class CopilotQueryRequest(BaseModel):
    question: str

@router.post("/query")
async def ask_copilot(req: CopilotQueryRequest):
    """Answers natural language business questions using grounded analytics and generates graphs."""
    df = DataLoader.load_dataset()
    summary = {
        "columns": list(df.columns),
        "total_rows": len(df)
    }
    result = await AIService.ask_question(req.question, summary)
    try:
        chart_obj = AnalyticsEngine.build_dynamic_chart_from_query(df, req.question)
        result["chart"] = chart_obj.model_dump()
    except Exception:
        result["chart"] = None
    return result


