"""
Unit Tests for Data Quality Engine.
"""

import pytest
import pandas as pd
import numpy as np
import os
import sys

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.data_quality import DataQualityEngine


def test_data_quality_profiling():
    test_df = pd.DataFrame({
        "order_id": ["101", "102", "103", "101"],  # 1 duplicate row
        "sales": ["$100.50", "$250.00", "$50.25", "$100.50"],  # Disguised numeric
        "profit": [10.5, np.nan, 5.0, 10.5],  # 1 missing value
        "date": ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-01"]
    })

    engine = DataQualityEngine(test_df)
    profile = engine.profile()

    assert profile["total_rows"] == 4
    assert profile["total_cols"] == 4
    assert profile["duplicate_rows"] == 1
    assert profile["total_nulls"] == 1
    assert "sales" in profile["disguised_numerics"]
    assert profile["health_score"] < 100


def test_data_cleaning_pipeline():
    test_df = pd.DataFrame({
        "  Region Name ": [" North ", "South", "North", "South "],
        " Sales ": ["$100", "$200", "$100", "$400"],
        " Profit ": [10, np.nan, 10, 40]
    })

    engine = DataQualityEngine(test_df)
    cleaned, log = engine.clean_dataset(
        strip_whitespace=True,
        drop_duplicates=True,
        convert_dates=False,
        convert_numerics=True,
        impute_strategy="median_mode"
    )

    # Columns should be cleaned to lowercase snake_case
    assert "region_name" in cleaned.columns
    assert "sales" in cleaned.columns
    # Disguised numeric converted to float
    assert pd.api.types.is_numeric_dtype(cleaned["sales"])
    # No nulls after median imputation
    assert cleaned["profit"].isnull().sum() == 0
    # Duplicate removed
    assert len(cleaned) == 3

