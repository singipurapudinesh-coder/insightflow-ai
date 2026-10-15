"""
Visualizer Module for InsightFlow AI.
Generates responsive, publication-grade interactive Plotly charts and auto-dashboards.
"""

from typing import Dict, Any, Optional
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


CHART_THEME = "plotly_white"
COLOR_SEQUENCE = ["#4361EE", "#3A0CA3", "#7209B7", "#F72585", "#4CC9F0", "#06D6A0", "#FFB703"]


def generate_chart(
    df: pd.DataFrame,
    chart_type: str,
    x_col: Optional[str] = None,
    y_col: Optional[str] = None,
    title: str = "InsightFlow AI Visualization"
) -> go.Figure:
    """Creates a styled Plotly figure based on the requested chart type."""
    if df.empty:
        fig = go.Figure()
        fig.add_annotation(text="No data available for the specified query.", showarrow=False)
        return fig

    # Default dimension/metric selection if not specified
    if not x_col:
        x_col = df.columns[0]
    if not y_col and len(df.columns) > 1:
        y_col = df.columns[1]

    ctype = chart_type.lower()

    if ctype == "bar":
        fig = px.bar(
            df,
            x=x_col,
            y=y_col,
            title=title,
            text_auto=".2s",
            color=y_col if y_col in df.select_dtypes(include=["number"]).columns else None,
            color_continuous_scale="Blues",
            template=CHART_THEME
        )
        fig.update_layout(xaxis_tickangle=-30)

    elif ctype == "line":
        fig = px.line(
            df,
            x=x_col,
            y=y_col,
            title=title,
            markers=True,
            template=CHART_THEME,
            color_discrete_sequence=COLOR_SEQUENCE
        )
        fig.update_traces(line=dict(width=3))

    elif ctype == "pie":
        fig = px.pie(
            df,
            names=x_col,
            values=y_col,
            title=title,
            hole=0.45,  # Donut style
            template=CHART_THEME,
            color_discrete_sequence=COLOR_SEQUENCE
        )

    elif ctype == "scatter":
        fig = px.scatter(
            df,
            x=x_col,
            y=y_col,
            title=title,
            trendline="ols" if len(df) > 5 and y_col in df.select_dtypes(include=["number"]).columns else None,
            template=CHART_THEME,
            color_discrete_sequence=COLOR_SEQUENCE
        )

    else:
        # Default fallback to Bar
        fig = px.bar(df, x=x_col, y=y_col, title=title, template=CHART_THEME)

    fig.update_layout(
        font=dict(family="Inter, Segoe UI, sans-serif", size=13),
        title=dict(font=dict(size=18, color="#1E293B")),
        margin=dict(l=40, r=40, t=60, b=40),
        hoverlabel=dict(bgcolor="white", font_size=12)
    )
    return fig


def build_auto_dashboard(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Automatically discovers and builds:
    - Key executive KPIs (Revenue, Profit, Margin, Count)
    - Time-series monthly trends
    - Category & regional breakdowns
    """
    kpis = {}
    charts = {}

    num_cols = df.select_dtypes(include=["number"]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object"]).columns.tolist()
    dt_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()

    # 1. Compute Executive KPI Cards
    kpis["Total Records"] = f"{len(df):,}"

    sales_col = next((c for c in num_cols if "sale" in c.lower() or "rev" in c.lower()), None)
    profit_col = next((c for c in num_cols if "profit" in c.lower() or "margin" in c.lower()), None)

    if sales_col:
        tot_sales = df[sales_col].sum()
        kpis["Total Revenue"] = f"${tot_sales:,.2f}"
        if profit_col:
            tot_profit = df[profit_col].sum()
            margin = (tot_profit / tot_sales * 100) if tot_sales > 0 else 0
            kpis["Total Profit"] = f"${tot_profit:,.2f}"
            kpis["Profit Margin"] = f"{margin:.1f}%"
    elif num_cols:
        for c in num_cols[:3]:
            kpis[f"Sum of {c.title()}"] = f"{df[c].sum():,.2f}"

    # 2. Time Trend Chart
    date_col = dt_cols[0] if dt_cols else None
    if not date_col:
        # Check if any column has 'date' in its name
        for c in df.columns:
            if "date" in c.lower():
                try:
                    df[c] = pd.to_datetime(df[c], errors="coerce")
                    date_col = c
                    break
                except Exception:
                    pass

    if date_col and sales_col:
        time_df = df.dropna(subset=[date_col]).copy()
        time_df["period"] = time_df[date_col].dt.to_period("M").astype(str)
        monthly_trend = time_df.groupby("period")[sales_col].sum().reset_index()
        monthly_trend = monthly_trend.sort_values(by="period")
        charts["trend"] = generate_chart(
            monthly_trend, "line", x_col="period", y_col=sales_col,
            title=f"Monthly {sales_col.title()} Trajectory"
        )

    # 3. Categorical Breakdowns
    reg_col = next((c for c in cat_cols if "reg" in c.lower() or "zone" in c.lower() or "state" in c.lower()), None)
    cat_col = next((c for c in cat_cols if "cat" in c.lower() or "type" in c.lower() or "segment" in c.lower()), None)

    metric_for_chart = profit_col or sales_col or (num_cols[0] if num_cols else None)

    if reg_col and metric_for_chart:
        reg_df = df.groupby(reg_col)[metric_for_chart].sum().reset_index()
        reg_df = reg_df.sort_values(by=metric_for_chart, ascending=False)
        charts["region"] = generate_chart(
            reg_df, "bar", x_col=reg_col, y_col=metric_for_chart,
            title=f"{metric_for_chart.title()} Distribution by {reg_col.title()}"
        )

    if cat_col and metric_for_chart:
        cat_df = df.groupby(cat_col)[metric_for_chart].sum().reset_index()
        cat_df = cat_df.sort_values(by=metric_for_chart, ascending=False)
        charts["category"] = generate_chart(
            cat_df, "pie", x_col=cat_col, y_col=metric_for_chart,
            title=f"Market Share by {cat_col.title()}"
        )

    return {"kpis": kpis, "charts": charts}

