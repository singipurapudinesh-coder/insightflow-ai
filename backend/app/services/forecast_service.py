import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.linear_model import LinearRegression

class ForecastService:
    @staticmethod
    def generate_baseline_forecast(df: pd.DataFrame, periods_ahead: int = 6) -> Dict[str, Any]:
        """Calculates baseline regression trend and future forecast points."""
        date_col = next((c for c in ["order_date", "date"] if c in df.columns), None)
        sales_col = next((c for c in ["sales", "revenue"] if c in df.columns), None)
        
        if not date_col or not sales_col or df.empty:
            return {"forecast": [], "r2_score": 0.0}

        ts_df = df.dropna(subset=[date_col]).copy()
        ts_df["period"] = ts_df[date_col].dt.strftime("%Y-%m")
        grouped = ts_df.groupby("period")[sales_col].sum().reset_index().sort_values("period")
        
        if len(grouped) < 3:
            return {"forecast": [], "r2_score": 0.0}

        X = np.arange(len(grouped)).reshape(-1, 1)
        y = grouped[sales_col].values
        
        model = LinearRegression()
        model.fit(X, y)
        r2 = float(model.score(X, y))

        future_X = np.arange(len(grouped), len(grouped) + periods_ahead).reshape(-1, 1)
        future_y = model.predict(future_X)

        forecast_points = []
        for i, val in enumerate(future_y):
            forecast_points.append({
                "period": f"Period +{i+1}",
                "forecast_sales": round(float(max(0, val)), 2)
            })

        return {
            "forecast": forecast_points,
            "trend_slope": round(float(model.coef_[0]), 2),
            "r2_score": round(max(0.0, r2), 3)
        }

