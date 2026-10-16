import pandas as pd
from typing import Dict, Any, List

class DataCleaner:
    @staticmethod
    def handle_missing_values(df: pd.DataFrame, strategy: str = "auto") -> pd.DataFrame:
        cleaned = df.copy()
        for col in cleaned.columns:
            if cleaned[col].dtype in ["float64", "int64"]:
                cleaned[col] = cleaned[col].fillna(cleaned[col].median() if strategy == "median" else cleaned[col].mean())
            else:
                cleaned[col] = cleaned[col].fillna("Unknown")
        return cleaned

    @staticmethod
    def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
        return df.drop_duplicates()

