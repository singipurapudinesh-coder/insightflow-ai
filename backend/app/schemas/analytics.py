from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class KPISummary(BaseModel):
    total_revenue: float
    total_profit: float
    profit_margin_pct: float
    total_orders: int
    average_order_value: float
    total_quantity: int
    revenue_growth_pct: Optional[float] = None
    profit_growth_pct: Optional[float] = None
    comparison_period_label: Optional[str] = None
    baseline_description: Optional[str] = None

class TimeSeriesPoint(BaseModel):
    date: str
    sales: float
    profit: float
    orders: int

class CategoryBreakdown(BaseModel):
    category: str
    sales: float
    profit: float
    margin_pct: float
    orders: int

class RegionalBreakdown(BaseModel):
    region: str
    sales: float
    profit: float
    orders: int

class DashboardDataResponse(BaseModel):
    kpis: KPISummary
    time_series: List[TimeSeriesPoint]
    category_breakdown: List[CategoryBreakdown]
    regional_breakdown: List[RegionalBreakdown]
    dataset_name: str
    total_rows: int
    available_filters: Dict[str, List[str]]
    metric_name: str = "Sales"
    secondary_metric_name: str = "Profit"
    category_dim_name: str = "Category"
    regional_dim_name: str = "Region"

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    missing_count: int
    missing_pct: float
    unique_count: int
    sample_values: List[Any]

class DatasetProfileResponse(BaseModel):
    filename: str
    total_rows: int
    total_columns: int
    total_cells: int = 0
    total_missing_cells: int = 0
    completeness_pct: float = 100.0
    columns: List[ColumnInfo]
    quality_score: float
    formula_documentation: str = "Quality Score = max(0, round(100 - (missing_cells / total_cells * 100), 1))"
    preview_rows: List[Dict[str, Any]]


class DynamicChartRequest(BaseModel):
    query: str
    chart_type: Optional[str] = "auto"

class DynamicChartResponse(BaseModel):
    title: str
    description: str
    chart_type: str  # "bar", "line", "pie", "area"
    x_key: str
    y_key: str
    data: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    insights: List[str]
    query_echo: str

class DatasetCapabilitiesResponse(BaseModel):
    filename: str
    row_count: int
    column_count: int
    numeric_columns: List[str]
    categorical_columns: List[str]
    date_columns: List[str]
    suggested_questions: List[str]
    overview_summary: str


