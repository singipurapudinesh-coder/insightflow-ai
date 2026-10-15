"""
Anomaly Detection Engine for InsightFlow AI.
Detects outliers using Statistical Rolling Z-score (μ ± 3σ), IQR thresholds,
and time-series residual deviations with visual alerting.
"""

from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np
import plotly.graph_objects as go


class AnomalyDetector:
    def __init__(self, df: pd.DataFrame, metric_col: str, date_col: str = None):
        self.df = df.copy()
        self.metric_col = metric_col
        self.date_col = date_col

    def detect_zscore(self, threshold_sigma: float = 3.0, window: int = 14) -> Tuple[pd.DataFrame, Dict[str, Any], go.Figure]:
        """
        Detects anomalies where values exceed rolling mean ± threshold_sigma * rolling std.
        """
        df = self.df.dropna(subset=[self.metric_col]).copy()
        if self.date_col and self.date_col in df.columns:
            df[self.date_col] = pd.to_datetime(df[self.date_col])
            df = df.sort_values(by=self.date_col).reset_index(drop=True)

        s = df[self.metric_col]
        # Rolling stats (with min_periods fallback to expanding window)
        rolling_mean = s.rolling(window=window, min_periods=3).mean()
        rolling_std = s.rolling(window=window, min_periods=3).std().fillna(s.std())

        upper_bound = rolling_mean + (threshold_sigma * rolling_std)
        lower_bound = rolling_mean - (threshold_sigma * rolling_std)

        is_anomaly = (s > upper_bound) | (s < lower_bound)
        df["is_anomaly"] = is_anomaly
        df["upper_bound"] = upper_bound
        df["lower_bound"] = lower_bound

        anomalies_df = df[is_anomaly]
        total_records = len(df)
        anomaly_count = len(anomalies_df)
        anomaly_pct = round((anomaly_count / total_records) * 100, 2) if total_records > 0 else 0

        summary = {
            "method": f"Rolling Z-Score (Window={window}, Sigma={threshold_sigma})",
            "total_evaluated": total_records,
            "anomaly_count": anomaly_count,
            "anomaly_percentage": anomaly_pct,
            "max_spike": float(anomalies_df[self.metric_col].max()) if not anomalies_df.empty else None,
            "min_dip": float(anomalies_df[self.metric_col].min()) if not anomalies_df.empty else None
        }

        # Build Annotated Plotly Chart
        x_axis = df[self.date_col] if self.date_col and self.date_col in df.columns else df.index

        fig = go.Figure()
        # Baseline Metric Line
        fig.add_trace(go.Scatter(
            x=x_axis, y=df[self.metric_col],
            name=self.metric_col.title(),
            mode="lines",
            line=dict(color="#3B82F6", width=2)
        ))

        # Upper Bound
        fig.add_trace(go.Scatter(
            x=x_axis, y=upper_bound,
            name="Upper Alert Bound (+3σ)",
            mode="lines",
            line=dict(color="rgba(239, 68, 68, 0.4)", dash="dash")
        ))

        # Highlight Anomaly Points
        if not anomalies_df.empty:
            anom_x = anomalies_df[self.date_col] if self.date_col and self.date_col in df.columns else anomalies_df.index
            fig.add_trace(go.Scatter(
                x=anom_x, y=anomalies_df[self.metric_col],
                name="Detected Anomalies",
                mode="markers",
                marker=dict(color="#EF4444", size=10, symbol="x", line=dict(width=2, color="#991B1B")),
                hoverinfo="text",
                hovertext=[f"Anomaly Alert!<br>Value: {val:.2f}" for val in anomalies_df[self.metric_col]]
            ))

        fig.update_layout(
            title=f"Anomaly Radar for {self.metric_col.title()} ({anomaly_count} Anomalies Detected)",
            xaxis_title=self.date_col.title() if self.date_col else "Index",
            yaxis_title=self.metric_col.title(),
            template="plotly_white",
            hovermode="x",
            font=dict(family="Inter, sans-serif"),
            margin=dict(l=40, r=40, t=60, b=40)
        )

        return anomalies_df, summary, fig

    def detect_iqr(self, multiplier: float = 1.5) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Detects outliers using Interquartile Range (IQR)."""
        s = self.df[self.metric_col].dropna()
        q1 = s.quantile(0.25)
        q3 = s.quantile(0.75)
        iqr = q3 - q1
        lower_limit = q1 - (multiplier * iqr)
        upper_limit = q3 + (multiplier * iqr)

        anomalies_df = self.df[(self.df[self.metric_col] < lower_limit) | (self.df[self.metric_col] > upper_limit)]
        summary = {
            "method": f"IQR Outlier Rule ({multiplier}x)",
            "q1": round(q1, 2),
            "q3": round(q3, 2),
            "iqr": round(iqr, 2),
            "lower_threshold": round(lower_limit, 2),
            "upper_threshold": round(upper_limit, 2),
            "anomaly_count": len(anomalies_df)
        }
        return anomalies_df, summary

