from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class HealthCheckResponse(BaseModel):
    status: str = Field(default="healthy", description="API health status")
    app_name: str
    environment: str
    version: str = "1.0.0"
    timestamp: str
    sample_data_ready: bool
    details: Dict[str, Any] = {}

