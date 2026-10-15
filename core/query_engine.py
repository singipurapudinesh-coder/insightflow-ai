"""
Query Engine for InsightFlow AI.
Safely executes structured JSON query plans using deterministic Pandas operations
and benchmarks them against the SQL engine.
"""

import time
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np


class QueryEngine:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def execute_plan(self, plan: Dict[str, Any]) -> Tuple[pd.DataFrame, float, Dict[str, Any]]:
        """
        Executes structured plan dictionary.
        
        Returns:
            (result_df, execution_latency_ms, summary_stats)
        """
        start_t = time.perf_counter()
        df = self.df.copy()

        metric = plan.get("metric")
        agg = plan.get("aggregation", "sum").lower()
        group_by = plan.get("group_by")
        filters = plan.get("filters", [])
        sort_order = plan.get("sort_order", "desc")
        limit = plan.get("limit", 10)

        # 1. Apply Filters
        if filters and isinstance(filters, list):
            for f in filters:
                col = f.get("column")
                op = f.get("operator", "==")
                val = f.get("value")
                if col in df.columns and val is not None:
                    if op in ["==", "="]:
                        df = df[df[col].astype(str).str.lower() == str(val).lower()]
                    elif op == "!=":
                        df = df[df[col].astype(str).str.lower() != str(val).lower()]
                    elif op in [">", ">=", "<", "<="] and pd.api.types.is_numeric_dtype(df[col]):
                        try:
                            num_val = float(val)
                            if op == ">":
                                df = df[df[col] > num_val]
                            elif op == ">=":
                                df = df[df[col] >= num_val]
                            elif op == "<":
                                df = df[df[col] < num_val]
                            elif op == "<=":
                                df = df[df[col] <= num_val]
                        except Exception:
                            pass

        # 2. Aggregations
        agg_map = {
            "sum": "sum",
            "mean": "mean",
            "avg": "mean",
            "count": "count",
            "min": "min",
            "max": "max",
            "median": "median"
        }
        chosen_agg = agg_map.get(agg, "sum")

        summary_stats = {
            "total_records_analyzed": len(df),
            "top_entity": None,
            "top_value": None,
            "total_value": None
        }

        # Case A: KPI / Single Summary Metric (no group_by)
        if not group_by or group_by not in df.columns:
            if metric and metric in df.columns and pd.api.types.is_numeric_dtype(df[metric]):
                val = getattr(df[metric], chosen_agg)()
                result_df = pd.DataFrame([{f"{chosen_agg}_{metric}": round(val, 2)}])
                summary_stats["total_value"] = round(val, 2)
            else:
                result_df = pd.DataFrame([{"count": len(df)}])
                summary_stats["total_value"] = len(df)
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            return result_df, elapsed_ms, summary_stats

        # Case B: Grouped Aggregation
        if metric and metric in df.columns and pd.api.types.is_numeric_dtype(df[metric]):
            grouped = df.groupby(group_by)[metric].agg(chosen_agg).reset_index()
            result_col = f"{chosen_agg}_{metric}"
            grouped.rename(columns={metric: result_col}, inplace=True)
        else:
            grouped = df.groupby(group_by).size().reset_index(name="count")
            result_col = "count"

        # 3. Sorting
        if sort_order == "desc":
            grouped = grouped.sort_values(by=result_col, ascending=False)
        elif sort_order == "asc":
            grouped = grouped.sort_values(by=result_col, ascending=True)

        # 4. Limit
        if limit and isinstance(limit, int) and limit > 0:
            result_df = grouped.head(limit)
        else:
            result_df = grouped

        # Round numeric columns for cleaner display
        for col in result_df.select_dtypes(include=[np.number]).columns:
            result_df[col] = result_df[col].round(2)

        # Summary Statistics
        if not result_df.empty:
            summary_stats["top_entity"] = str(result_df.iloc[0][group_by])
            summary_stats["top_value"] = float(result_df.iloc[0][result_col])
            summary_stats["total_value"] = float(result_df[result_col].sum())

        elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
        return result_df, elapsed_ms, summary_stats

