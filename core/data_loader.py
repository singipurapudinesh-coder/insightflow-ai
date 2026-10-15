"""
Data Loader Module for InsightFlow AI.
Supports robust ingestion of CSV, TSV, XLSX, and XLS formats with automatic
delimiter, encoding, and format detection.
"""

import io
import os
import csv
from typing import Tuple, Dict, Any, Union
import pandas as pd


def detect_csv_delimiter(sample_bytes: bytes) -> str:
    """Attempts to detect delimiter from raw sample bytes using csv.Sniffer."""
    try:
        sample_str = sample_bytes.decode("utf-8", errors="ignore")[:4096]
        sniffer = csv.Sniffer()
        dialect = sniffer.sniff(sample_str, delimiters=[",", ";", "\t", "|"])
        return dialect.delimiter
    except Exception:
        return ","


def load_dataset(file_or_path: Union[str, io.BytesIO, bytes], filename: str = "") -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads dataset from a filepath or Streamlit UploadedFile buffer.
    
    Returns:
        (pd.DataFrame, metadata_dict)
    """
    metadata: Dict[str, Any] = {
        "filename": filename or (os.path.basename(file_or_path) if isinstance(file_or_path, str) else "uploaded_dataset"),
        "format": "csv",
        "encoding": "utf-8",
        "delimiter": ",",
        "file_size_kb": 0,
        "rows": 0,
        "columns": 0,
        "error": None
    }

    # Determine extension
    ext = os.path.splitext(metadata["filename"])[-1].lower()

    try:
        if ext in [".xlsx", ".xls"]:
            metadata["format"] = "excel"
            if isinstance(file_or_path, str):
                metadata["file_size_kb"] = round(os.path.getsize(file_or_path) / 1024, 2)
                df = pd.read_excel(file_or_path)
            else:
                if hasattr(file_or_path, "size"):
                    metadata["file_size_kb"] = round(file_or_path.size / 1024, 2)
                df = pd.read_excel(file_or_path)
        else:
            # CSV / TSV handling
            metadata["format"] = "csv"
            encodings = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
            df = None
            last_err = None

            # Handle buffer vs path
            if isinstance(file_or_path, str):
                metadata["file_size_kb"] = round(os.path.getsize(file_or_path) / 1024, 2)
                with open(file_or_path, "rb") as f:
                    sample = f.read(4096)
                delim = detect_csv_delimiter(sample)
                metadata["delimiter"] = delim

                for enc in encodings:
                    try:
                        df = pd.read_csv(file_or_path, sep=delim, encoding=enc)
                        metadata["encoding"] = enc
                        break
                    except (UnicodeDecodeError, Exception) as e:
                        last_err = e
            else:
                # Streamlit buffer
                content = file_or_path.read()
                metadata["file_size_kb"] = round(len(content) / 1024, 2)
                delim = detect_csv_delimiter(content[:4096])
                metadata["delimiter"] = delim

                for enc in encodings:
                    try:
                        df = pd.read_csv(io.BytesIO(content), sep=delim, encoding=enc)
                        metadata["encoding"] = enc
                        break
                    except (UnicodeDecodeError, Exception) as e:
                        last_err = e

            if df is None:
                raise ValueError(f"Failed to decode CSV file with supported encodings. Last error: {last_err}")

        # Basic cleanup: Strip whitespace from column headers
        df.columns = [str(c).strip() for c in df.columns]
        metadata["rows"] = int(df.shape[0])
        metadata["columns"] = int(df.shape[1])
        return df, metadata

    except Exception as e:
        metadata["error"] = str(e)
        raise RuntimeError(f"Data loading failed: {str(e)}")

