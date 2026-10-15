"""
Unit Tests for Query Engine and Database Guardrails.
"""

import pytest
import pandas as pd
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.query_engine import QueryEngine
from database.db import DatabaseEngine


def test_query_engine_grouped_aggregation():
    df = pd.DataFrame({
        "region": ["East", "West", "East", "West", "Central"],
        "sales": [100.0, 200.0, 150.0, 50.0, 300.0]
    })

    plan = {
        "metric": "sales",
        "aggregation": "sum",
        "group_by": "region",
        "sort_order": "desc",
        "limit": 2
    }

    engine = QueryEngine(df)
    res_df, latency, stats = engine.execute_plan(plan)

    assert len(res_df) == 2
    assert res_df.iloc[0]["region"] == "Central"
    assert res_df.iloc[0]["sum_sales"] == 300.0
    assert stats["top_entity"] == "Central"


def test_database_security_guardrails():
    db = DatabaseEngine()
    df = pd.DataFrame({"id": [1, 2], "val": [10, 20]})
    db.register_dataframe(df, "dataset")

    # Allowed query
    res, lat, err = db.execute_query("SELECT SUM(val) AS total FROM dataset")
    assert err is None
    assert res.iloc[0]["total"] == 30

    # Blocked dangerous queries
    res, lat, err = db.execute_query("DROP TABLE dataset")
    assert "Security Violation" in err

    res, lat, err = db.execute_query("DELETE FROM dataset WHERE id = 1")
    assert "Security Violation" in err

