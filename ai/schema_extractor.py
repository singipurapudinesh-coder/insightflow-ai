"""
Schema Extractor Module for InsightFlow AI.
Extracts schema metadata and representative samples to allow LLMs to generate
structured queries without leaking or uploading the entire dataset.
"""

from typing import Dict, Any
import pandas as pd


def extract_schema_summary(df: pd.DataFrame, max_sample_values: int = 3) -> Dict[str, Any]:
    """
    Extracts a privacy-safe, lightweight schema overview for LLM context.
    """
    columns_meta = []
    numeric_cols = []
    categorical_cols = []
    datetime_cols = []

    for col in df.columns:
        s = df[col]
        dtype = str(s.dtype)
        samples = [str(v) for v in s.dropna().unique()[:max_sample_values]]
        
        col_type = "categorical"
        if pd.api.types.is_numeric_dtype(s):
            col_type = "numeric"
            numeric_cols.append(col)
        elif pd.api.types.is_datetime64_any_dtype(s):
            col_type = "datetime"
            datetime_cols.append(col)
        else:
            categorical_cols.append(col)

        columns_meta.append({
            "name": col,
            "type": col_type,
            "pandas_dtype": dtype,
            "sample_values": samples
        })

    return {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": columns_meta,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "datetime_columns": datetime_cols
    }

