"""
Data Quality Engine for InsightFlow AI.
Performs comprehensive dataset profiling, automated hygiene scoring,
issue diagnosis, and targeted cleaning operations.
"""

from typing import Dict, List, Any, Tuple
import re
import pandas as pd
import numpy as np


class DataQualityEngine:
    def __init__(self, df: pd.DataFrame = None):
        if df is None:
            self.raw_df = pd.DataFrame()
            self.df = pd.DataFrame()
        else:
            self.raw_df = df.copy()
            self.df = df.copy()

    def profile(self) -> Dict[str, Any]:
        """Runs a complete diagnostic scan on the dataset."""
        df = self.df
        total_rows = len(df)
        total_cols = len(df.columns)
        total_cells = total_rows * total_cols if total_rows > 0 and total_cols > 0 else 1

        # Missing values
        null_counts = df.isnull().sum()
        total_nulls = int(null_counts.sum())
        null_percentage = round((total_nulls / total_cells) * 100, 2)

        # Duplicate rows
        duplicate_rows = int(df.duplicated().sum())
        duplicate_percentage = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0

        # Memory usage
        mem_bytes = df.memory_usage(deep=True).sum()
        mem_mb = round(mem_bytes / (1024 * 1024), 2)

        # Column-level diagnostics
        columns_info = []
        disguised_numerics = []
        potential_dates = []

        for col in df.columns:
            s = df[col]
            dtype_str = str(s.dtype)
            col_nulls = int(s.isnull().sum())
            col_null_pct = round((col_nulls / total_rows) * 100, 2) if total_rows > 0 else 0
            unique_count = int(s.nunique(dropna=True))

            inferred_type = "categorical"
            if pd.api.types.is_numeric_dtype(s):
                inferred_type = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(s):
                inferred_type = "datetime"
            elif pd.api.types.is_bool_dtype(s):
                inferred_type = "boolean"
            else:
                # Check if it's disguised numeric (e.g. contains currency symbols or numeric strings)
                sample_valid = s.dropna().astype(str).head(30)
                if len(sample_valid) > 0:
                    currency_cleaned = sample_valid.str.replace(r"[\$,₹,€,£,%\s]", "", regex=True)
                    numeric_success = pd.to_numeric(currency_cleaned, errors="coerce").notnull().sum()
                    if numeric_success / len(sample_valid) >= 0.8:
                        disguised_numerics.append(col)
                        inferred_type = "numeric (disguised as text)"
                    else:
                        # Check if it's a date string
                        try:
                            date_parsed = pd.to_datetime(sample_valid, errors="coerce").notnull().sum()
                            if date_parsed / len(sample_valid) >= 0.8:
                                potential_dates.append(col)
                                inferred_type = "datetime (disguised as text)"
                        except Exception:
                            pass

            columns_info.append({
                "column": col,
                "dtype": dtype_str,
                "inferred_type": inferred_type,
                "missing_count": col_nulls,
                "missing_pct": col_null_pct,
                "unique_values": unique_count,
                "sample_values": s.dropna().astype(str).unique()[:4].tolist()
            })

        # Calculate Data Cleanliness / Health Score (0-100)
        # Deduct penalties for nulls, duplicates, and disguised types
        null_penalty = min(35, (null_percentage * 1.5))
        dup_penalty = min(25, (duplicate_percentage * 2.0))
        format_penalty = min(20, (len(disguised_numerics) + len(potential_dates)) * 5)
        health_score = max(0, round(100 - (null_penalty + dup_penalty + format_penalty), 1))

        return {
            "total_rows": total_rows,
            "total_cols": total_cols,
            "total_nulls": total_nulls,
            "null_percentage": null_percentage,
            "duplicate_rows": duplicate_rows,
            "duplicate_percentage": duplicate_percentage,
            "memory_mb": mem_mb,
            "health_score": health_score,
            "disguised_numerics": disguised_numerics,
            "potential_dates": potential_dates,
            "columns_info": columns_info
        }

    def clean_dataset(
        self,
        strip_whitespace: bool = True,
        drop_duplicates: bool = True,
        convert_dates: bool = True,
        convert_numerics: bool = True,
        impute_strategy: str = "none"  # "none", "median_mode", "drop_rows"
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Executes user-selected cleaning operations.
        Returns the transformed DataFrame and an audit log of changes made.
        """
        df = self.df.copy()
        log = []

        # 1. Clean Column Names
        if strip_whitespace:
            orig_cols = list(df.columns)
            df.columns = [re.sub(r"\s+", "_", str(c).strip().lower()) for c in df.columns]
            if df.columns.tolist() != orig_cols:
                log.append("Standardized and trimmed column names to lowercase snake_case.")

            # Trim text values in object columns
            for col in df.select_dtypes(include=["object", "string"]).columns:
                df[col] = df[col].astype(str).str.strip().replace("nan", np.nan)
            log.append("Trimmed whitespace across string/text values.")

        # 2. Deduplicate
        if drop_duplicates:
            init_count = len(df)
            df = df.drop_duplicates()
            dropped = init_count - len(df)
            if dropped > 0:
                log.append(f"Removed {dropped} exact duplicate row(s).")

        # 3. Disguised Numerics Conversion
        if convert_numerics:
            converted_num_cols = []
            for col in df.select_dtypes(include=["object", "string"]).columns:
                sample = df[col].dropna().astype(str).head(30)
                if len(sample) > 0:
                    cleaned_sample = sample.str.replace(r"[\$,₹,€,£,%\s]", "", regex=True)
                    if pd.to_numeric(cleaned_sample, errors="coerce").notnull().sum() / len(sample) >= 0.8:
                        # Attempt full conversion
                        cleaned_full = df[col].astype(str).str.replace(r"[\$,₹,€,£,%\s]", "", regex=True)
                        df[col] = pd.to_numeric(cleaned_full, errors="coerce")
                        converted_num_cols.append(col)
            if converted_num_cols:
                log.append(f"Sanitized and converted numeric columns: {', '.join(converted_num_cols)}")

        # 4. Disguised Datetime Conversion
        if convert_dates:
            converted_date_cols = []
            for col in df.columns:
                if df[col].dtype == "object":
                    sample = df[col].dropna().astype(str).head(30)
                    if len(sample) > 0:
                        try:
                            # Try parsing dates if matches date-like pattern
                            if sample.str.contains(r"\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}").sum() / len(sample) >= 0.7:
                                df[col] = pd.to_datetime(df[col], errors="coerce")
                                converted_date_cols.append(col)
                        except Exception:
                            pass
            if converted_date_cols:
                log.append(f"Parsed datetime formats in columns: {', '.join(converted_date_cols)}")

        # 5. Missing value imputation
        if impute_strategy == "drop_rows":
            before = len(df)
            df = df.dropna()
            log.append(f"Dropped {before - len(df)} row(s) containing missing values.")
        elif impute_strategy == "median_mode":
            imputed_cols = []
            for col in df.columns:
                if df[col].isnull().sum() > 0:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        med_val = df[col].median()
                        df[col] = df[col].fillna(med_val)
                        imputed_cols.append(f"{col} (median={round(med_val, 2)})")
                    else:
                        mode_s = df[col].mode()
                        mode_val = mode_s[0] if len(mode_s) > 0 else "Unknown"
                        df[col] = df[col].fillna(mode_val)
                        imputed_cols.append(f"{col} (mode='{mode_val}')")
            if imputed_cols:
                log.append(f"Imputed missing values for: {', '.join(imputed_cols)}")

        self.df = df
        return df, log
