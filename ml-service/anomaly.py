"""
Anomaly Detection Module for InsightFlow AI ML Microservice.
Flags outliers using rolling Z-Score (μ ± 3σ) and Interquartile Range (IQR).
"""

from typing import List, Dict, Any
import numpy as np
import pandas as pd


def detect_anomalies(values: List[float], labels: List[str] = None, sigma: float = 3.0) -> Dict[str, Any]:
    """Detects statistical outliers and returns flagged indices and severity."""
    s = pd.Series(values)
    rolling_mean = s.rolling(window=14, min_periods=3).mean()
    rolling_std = s.rolling(window=14, min_periods=3).std().fillna(s.std() or 1.0)

    upper_bound = rolling_mean + (sigma * rolling_std)
    lower_bound = rolling_mean - (sigma * rolling_std)

    anomalies = []
    for idx, val in enumerate(values):
        if val > upper_bound.iloc[idx] or val < lower_bound.iloc[idx]:
            anomalies.append({
                "index": idx,
                "label": labels[idx] if labels and idx < len(labels) else str(idx),
                "value": round(float(val), 2),
                "upper_bound": round(float(upper_bound.iloc[idx]), 2),
                "lower_bound": round(float(lower_bound.iloc[idx]), 2),
                "type": "spike" if val > upper_bound.iloc[idx] else "dip"
            })

    # IQR stats
    q1 = float(s.quantile(0.25))
    q3 = float(s.quantile(0.75))
    iqr = q3 - q1

    return {
        "total_analyzed": len(values),
        "anomaly_count": len(anomalies),
        "anomaly_rate_pct": round((len(anomalies) / len(values)) * 100, 2) if len(values) > 0 else 0,
        "iqr_bounds": {
            "lower": round(q1 - 1.5 * iqr, 2),
            "upper": round(q3 + 1.5 * iqr, 2)
        },
        "anomalies": anomalies
    }

