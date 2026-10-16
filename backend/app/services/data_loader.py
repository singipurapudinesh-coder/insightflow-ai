import os
import pandas as pd
from typing import Optional
from app.core.config import settings

class DataLoader:
    _cached_sample_df: Optional[pd.DataFrame] = None
    _current_df: Optional[pd.DataFrame] = None
    _current_filename: str = "sales_sample.csv"

    @classmethod
    def get_current_filename(cls) -> str:
        return cls._current_filename

    @classmethod
    def reset_dataset(cls) -> pd.DataFrame:
        """Resets the dataset back to the initial sample dataset and clears uploads."""
        cls._current_df = None
        cls._current_filename = "sales_sample.csv"
        return cls.load_dataset()

    @classmethod
    def load_dataset(cls, filepath: Optional[str] = None) -> pd.DataFrame:
        """
        Loads dataset safely with encoding fallbacks and date normalization.
        If filepath is provided, loads and sets it as the active dataset.
        If no filepath provided, returns the currently active dataset.
        """
        if filepath is None and cls._current_df is not None:
            return cls._current_df.copy()

        target_path = filepath or settings.SAMPLE_DATA_PATH
        
        # Check cache for default sample dataset
        if filepath is None and cls._cached_sample_df is not None:
            cls._current_df = cls._cached_sample_df.copy()
            cls._current_filename = "sales_sample.csv"
            return cls._current_df.copy()

        if not target_path or not os.path.exists(target_path):
            current_file_dir = os.path.dirname(os.path.abspath(__file__))
            candidates = [
                os.path.join(current_file_dir, "..", "..", "sample_data", "sales_sample.csv"),
                os.path.join(current_file_dir, "..", "..", "..", "sample_data", "sales_sample.csv"),
                os.path.join(os.getcwd(), "sample_data", "sales_sample.csv"),
                os.path.join(os.getcwd(), "backend", "sample_data", "sales_sample.csv"),
                os.path.join(os.getcwd(), "..", "sample_data", "sales_sample.csv"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    target_path = os.path.abspath(c)
                    break
            else:
                raise FileNotFoundError(f"Dataset not found at path: {target_path}")

        ext = os.path.splitext(target_path)[1].lower()
        if ext == ".csv":
            try:
                df = pd.read_csv(target_path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(target_path, encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(target_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        # Clean column names
        df.columns = [str(c).strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]

        # Convert date columns if present
        for col in df.columns:
            if any(term in col for term in ["date", "time", "year", "month"]):
                try:
                    df[col] = pd.to_datetime(df[col], errors="coerce")
                except Exception:
                    pass

        # Clean currency and numeric columns (handle '$', ',', '%', etc.)
        for col in df.columns:
            if any(term in col for term in ["sale", "profit", "discount", "qty", "quantity", "amount", "revenue", "cost", "price", "margin", "total"]):
                if df[col].dtype == object or df[col].dtype == "string":
                    df[col] = (
                        df[col]
                        .astype(str)
                        .str.replace("$", "", regex=False)
                        .str.replace(",", "", regex=False)
                        .str.replace("%", "", regex=False)
                        .str.strip()
                    )
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        # Set active dataset
        cls._current_df = df
        if filepath:
            cls._current_filename = os.path.basename(filepath)
        else:
            cls._cached_sample_df = df
            cls._current_filename = "sales_sample.csv"

        return cls._current_df.copy()

    @classmethod
    def is_sample_data_available(cls) -> bool:
        """Checks if sample dataset file exists on disk."""
        if settings.SAMPLE_DATA_PATH and os.path.exists(settings.SAMPLE_DATA_PATH):
            return True
        current_file_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.join(current_file_dir, "..", "..", "sample_data", "sales_sample.csv"),
            os.path.join(current_file_dir, "..", "..", "..", "sample_data", "sales_sample.csv"),
            os.path.join(os.getcwd(), "sample_data", "sales_sample.csv"),
            os.path.join(os.getcwd(), "backend", "sample_data", "sales_sample.csv"),
        ]
        return any(os.path.exists(c) for c in candidates)
