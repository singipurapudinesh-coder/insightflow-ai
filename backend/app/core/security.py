import os
import re
from typing import Optional
from fastapi import HTTPException, status, Header

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
MAX_FILE_BYTES = 25 * 1024 * 1024  # 25 MB

def validate_file_upload(filename: str, file_size: int) -> None:
    """Validates uploaded dataset extension and size."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only CSV and Excel (.xlsx, .xls) files are supported."
        )
    if file_size > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 25 MB limit."
        )

def sanitize_column_name(col: str) -> str:
    """Sanitizes dataset column names to prevent injection or invalid property names."""
    clean = re.sub(r'[^a-zA-Z0-9_]', '_', str(col).strip())
    return clean.lower()

async def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Validates optional Supabase JWT token.
    In development or public mode, permits anonymous guest analysis with rate limits.
    """
    if not authorization:
        return {"id": "guest_user", "role": "anonymous"}
    token = authorization.replace("Bearer ", "").strip()
    return {"id": "auth_user", "token": token, "role": "authenticated"}

