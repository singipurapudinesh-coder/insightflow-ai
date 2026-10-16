from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
import pandas as pd
from app.core.config import settings
from app.core.security import validate_file_upload
from app.services.data_loader import DataLoader
from app.services.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/datasets", tags=["datasets"])

@router.get("/current")
def get_current_dataset_info():
    """Returns metadata about the active dataset."""
    df = DataLoader.load_dataset()
    return {
        "name": DataLoader.get_current_filename(),
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "memory_usage_kb": round(df.memory_usage(deep=True).sum() / 1024, 2)
    }

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads a CSV or Excel dataset with validation and sets it as the active dataset."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file was provided.")

    validate_file_upload(file.filename, 0) # basic ext check
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    if not safe_filename:
        safe_filename = "dataset.csv"

    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds 25 MB limit.")

    with open(file_path, "wb") as buffer:
        buffer.write(contents)
        
    try:
        df = DataLoader.load_dataset(file_path)
        profile = AnalyticsEngine.profile_dataset(df, filename=safe_filename)
        
        return {
            "message": f"Successfully loaded dataset '{safe_filename}'",
            "filename": safe_filename,
            "row_count": len(df),
            "column_count": len(df.columns),
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse spreadsheet: {str(e)}")

@router.delete("/current")
@router.post("/reset")
def reset_dataset():
    """
    Removes the uploaded dataset and resets back to the initial sample dataset,
    allowing the user to easily remove a wrong dataset and start fresh.
    """
    try:
        df = DataLoader.reset_dataset()
        profile = AnalyticsEngine.profile_dataset(df, filename="sales_sample.csv")
        return {
            "message": "Dataset removed successfully. Reset to default sample dataset.",
            "filename": DataLoader.get_current_filename(),
            "row_count": len(df),
            "column_count": len(df.columns),
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset dataset: {str(e)}")



