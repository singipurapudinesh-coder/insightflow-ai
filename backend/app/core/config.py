from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    APP_NAME: str = "InsightFlow AI Backend"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Origins
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://insightflow-ai.vercel.app",
    ]

    # Database & Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # LLM Settings
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"
    
    # Storage & Sample Data
    SAMPLE_DATA_PATH: str = ""
    UPLOAD_DIR: str = ""
    MAX_UPLOAD_SIZE_MB: int = 25

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Determine project root and paths
        current_dir = os.path.dirname(os.path.abspath(__file__)) # .../backend/app/core
        app_dir = os.path.dirname(current_dir) # .../backend/app
        backend_dir = os.path.dirname(app_dir) # .../backend
        root_dir = os.path.dirname(backend_dir) # .../insightflow-ai

        candidate_paths = [
            os.path.join(root_dir, "sample_data", "sales_sample.csv"),
            os.path.join(backend_dir, "sample_data", "sales_sample.csv"),
            os.path.join(os.getcwd(), "sample_data", "sales_sample.csv"),
            os.path.join(os.getcwd(), "..", "sample_data", "sales_sample.csv"),
        ]
        
        found_path = None
        for p in candidate_paths:
            if os.path.exists(p):
                found_path = os.path.abspath(p)
                break
        
        self.SAMPLE_DATA_PATH = found_path or os.path.abspath(candidate_paths[0])
        self.UPLOAD_DIR = os.path.join(backend_dir, "uploads")


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

settings = Settings()
