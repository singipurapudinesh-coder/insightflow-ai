import plotly.express as px
import pandas as pd
from typing import Dict, Any

class ChartService:
    @staticmethod
    def generate_plotly_spec(df: pd.DataFrame, chart_type: str, x_col: str, y_col: str, title: str = "") -> Dict[str, Any]:
        """Generates Plotly JSON specification for interactive charts."""
        if chart_type == "bar":
            fig = px.bar(df, x=x_col, y=y_col, title=title)
        elif chart_type == "line":
            fig = px.line(df, x=x_col, y=y_col, title=title)
        elif chart_type == "pie":
            fig = px.pie(df, names=x_col, values=y_col, title=title)
        else:
            fig = px.scatter(df, x=x_col, y=y_col, title=title)
        
        return fig.to_dict()

