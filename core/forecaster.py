"""
Forecasting Engine for InsightFlow AI.
Performs chronological time-series aggregation, trend & seasonal forecasting,
confidence interval generation, and leak-free backtest evaluation.
"""

from typing import Dict, Any, Tuple
import datetime
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error


class Forecaster:
    def __init__(self, df: pd.DataFrame, date_col: str, metric_col: str, freq: str = "D"):
        self.raw_df = df
        self.date_col = date_col
        self.metric_col = metric_col
        self.freq = freq  # "D" for daily, "W" for weekly, "M" for monthly

    def prepare_series(self) -> pd.DataFrame:
        """Cleans and aggregates time-series to consistent intervals."""
        df = self.raw_df.dropna(subset=[self.date_col, self.metric_col]).copy()
        df[self.date_col] = pd.to_datetime(df[self.date_col])
        
        # Aggregate
        ts = df.set_index(self.date_col)[self.metric_col].resample(self.freq).sum().reset_index()
        ts.columns = ["ds", "y"]
        ts = ts.sort_values(by="ds").reset_index(drop=True)
        # Fill missing dates with 0 or forward fill
        ts["y"] = ts["y"].fillna(0)
        return ts

    def train_and_forecast(self, horizon: int = 30) -> Tuple[pd.DataFrame, Dict[str, float], go.Figure]:
        """
        Fits a Time-Series ML Model (Trend + Fourier Seasonality) with prediction intervals.
        
        Returns:
            (forecast_df, metrics_dict, plotly_fig)
        """
        ts = self.prepare_series()
        if len(ts) < 10:
            raise ValueError(f"Insufficient time-series data points ({len(ts)} found, minimum 10 required).")

        # Chronological Train-Test Split (Last 20% for backtest validation)
        split_idx = max(int(len(ts) * 0.8), len(ts) - min(horizon, max(3, len(ts) // 5)))
        train_df = ts.iloc[:split_idx].copy()
        test_df = ts.iloc[split_idx:].copy()

        # Feature engineering helper: Days ordinal + Fourier terms
        start_date = ts["ds"].min()

        def extract_features(df_subset: pd.DataFrame) -> np.ndarray:
            t = (df_subset["ds"] - start_date).dt.days.values
            # Trend
            features = [t, t ** 2 / 1000]
            # Weekly Fourier terms (period = 7 days)
            features.append(np.sin(2 * np.pi * t / 7))
            features.append(np.cos(2 * np.pi * t / 7))
            # Monthly/Annual Fourier terms (period = 30 and 365)
            features.append(np.sin(2 * np.pi * t / 30.4))
            features.append(np.cos(2 * np.pi * t / 30.4))
            features.append(np.sin(2 * np.pi * t / 365.25))
            features.append(np.cos(2 * np.pi * t / 365.25))
            return np.column_stack(features)

        # 1. Backtest Evaluation
        X_train = extract_features(train_df)
        y_train = train_df["y"].values
        X_test = extract_features(test_df)
        y_test = test_df["y"].values

        eval_model = Ridge(alpha=1.0)
        eval_model.fit(X_train, y_train)
        y_test_pred = np.maximum(0, eval_model.predict(X_test))

        mae = float(mean_absolute_error(y_test, y_test_pred))
        rmse = float(root_mean_squared_error(y_test, y_test_pred))
        # Non-zero MAPE protection
        non_zero_mask = y_test > 0
        if np.sum(non_zero_mask) > 0:
            mape = float(np.mean(np.abs((y_test[non_zero_mask] - y_test_pred[non_zero_mask]) / y_test[non_zero_mask])) * 100)
        else:
            mape = 0.0

        metrics = {
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "MAPE": round(mape, 2)
        }

        # 2. Fit Full Model for Future Forecast
        full_model = Ridge(alpha=1.0)
        X_full = extract_features(ts)
        y_full = ts["y"].values
        full_model.fit(X_full, y_full)

        # Estimate residual variance for confidence intervals
        residuals = y_full - full_model.predict(X_full)
        std_resid = np.std(residuals)

        # Generate future dates
        last_date = ts["ds"].max()
        freq_alias = "D" if self.freq == "D" else ("W" if self.freq == "W" else "MS")
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=horizon, freq=freq_alias)
        future_df = pd.DataFrame({"ds": future_dates})

        X_future = extract_features(future_df)
        y_future_pred = np.maximum(0, full_model.predict(X_future))

        # Prediction interval (95% confidence ~ 1.96 std)
        # Uncertainty expands with time horizon
        time_growth = np.linspace(1.0, 1.6, horizon)
        lower_bound = np.maximum(0, y_future_pred - (1.96 * std_resid * time_growth))
        upper_bound = y_future_pred + (1.96 * std_resid * time_growth)

        forecast_results = pd.DataFrame({
            "ds": future_dates,
            "forecast": np.round(y_future_pred, 2),
            "lower_bound": np.round(lower_bound, 2),
            "upper_bound": np.round(upper_bound, 2)
        })

        # 3. Create Interactive Forecast Plot
        fig = go.Figure()

        # Historical Actuals
        fig.add_trace(go.Scatter(
            x=ts["ds"], y=ts["y"],
            name="Historical Actual",
            mode="lines+markers",
            line=dict(color="#1E293B", width=2),
            marker=dict(size=4)
        ))

        # Future Forecast Line
        fig.add_trace(go.Scatter(
            x=forecast_results["ds"], y=forecast_results["forecast"],
            name="Forecasted Trend",
            mode="lines+markers",
            line=dict(color="#4361EE", width=3, dash="dash"),
            marker=dict(size=5, color="#4361EE")
        ))

        # Shaded Confidence Interval
        fig.add_trace(go.Scatter(
            x=pd.concat([forecast_results["ds"], forecast_results["ds"][::-1]]),
            y=pd.concat([forecast_results["upper_bound"], forecast_results["lower_bound"][::-1]]),
            fill="toself",
            fillcolor="rgba(67, 97, 238, 0.18)",
            line=dict(color="rgba(255,255,255,0)"),
            name="95% Confidence Interval",
            hoverinfo="skip"
        ))

        fig.update_layout(
            title=f"{horizon}-Day Forward Forecast for {self.metric_col.title()}",
            xaxis_title="Timeline",
            yaxis_title=self.metric_col.title(),
            template="plotly_white",
            hovermode="x unified",
            font=dict(family="Inter, sans-serif"),
            margin=dict(l=40, r=40, t=60, b=40)
        )

        return forecast_results, metrics, fig

