import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_dashboard_analytics_endpoint():
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    
    # Verify calculated real KPIs
    assert "kpis" in data
    assert data["kpis"]["total_revenue"] > 0
    assert data["kpis"]["total_profit"] > 0
    assert data["kpis"]["total_orders"] > 0
    assert data["kpis"]["profit_margin_pct"] >= 0
    
    # Verify time series
    assert len(data["time_series"]) > 0
    assert "sales" in data["time_series"][0]
    
    # Verify category breakdown
    assert len(data["category_breakdown"]) > 0
    assert "category" in data["category_breakdown"][0]

def test_dataset_profile_endpoint():
    response = client.get("/api/analytics/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] > 0
    assert data["total_columns"] > 0
    assert data["quality_score"] > 80.0
    assert len(data["columns"]) > 0

def test_copilot_grounded_query():
    response = client.post("/api/copilot/query", json={"question": "Which region has the highest profit?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "confidence" in data

def test_upload_csv_dataset():
    csv_content = b"order_id,date,category,region,sales,profit\nORD-1,2025-01-01,Tech,North,500.0,75.0\nORD-2,2025-01-02,Office,South,300.0,45.0\n"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("test_sales.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "test_sales.csv" in data["filename"]
    assert data["row_count"] == 2
    assert data["profile"]["quality_score"] == 100.0

    # Verify that dashboard immediately reflects the uploaded dataset
    dash_res = client.get("/api/analytics/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["dataset_name"] == "test_sales.csv"
    assert dash_data["kpis"]["total_revenue"] == 800.0
    assert dash_data["kpis"]["total_profit"] == 120.0

def test_dataset_capabilities_endpoint():
    response = client.get("/api/analytics/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert "suggested_questions" in data
    assert len(data["suggested_questions"]) > 0
    assert "numeric_columns" in data

def test_generate_dynamic_chart_endpoint():
    response = client.post(
        "/api/analytics/generate-chart",
        json={"query": "Compare sales by category as a pie chart", "chart_type": "pie"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert data["chart_type"] == "pie"
    assert len(data["data"]) > 0
    assert "insights" in data
    assert len(data["insights"]) > 0

def test_reports_summary_endpoint():
    response = client.get("/api/reports/summary")
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "kpis" in data
    assert "key_takeaways" in data
    assert len(data["key_takeaways"]) > 0
    assert "quality_score" in data

def test_reset_dataset_endpoint():
    # First upload custom dataset
    csv_content = b"a,b,c\n1,2,3\n4,5,6\n"
    client.post(
        "/api/datasets/upload",
        files={"file": ("temp_custom.csv", csv_content, "text/csv")}
    )
    # Verify current is temp_custom
    curr = client.get("/api/datasets/current").json()
    assert curr["name"] == "temp_custom.csv"

    # Reset / delete current dataset
    reset_res = client.delete("/api/datasets/current")
    assert reset_res.status_code == 200
    reset_data = reset_res.json()
    assert reset_data["filename"] == "sales_sample.csv"

    # Verify current is now back to default sales_sample.csv
    curr_after = client.get("/api/datasets/current").json()
    assert curr_after["name"] == "sales_sample.csv"

def test_exact_kpi_audit_values():
    """Audits exact KPI calculations against known ground truth for sample data."""
    # Ensure active dataset is default sample
    client.delete("/api/datasets/current")
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    kpis = data["kpis"]

    # Verify exact numerical results
    assert kpis["total_revenue"] == 1285690.47
    assert kpis["total_profit"] == 161473.74
    assert kpis["profit_margin_pct"] == 12.56
    assert kpis["total_orders"] == 600
    assert kpis["average_order_value"] == 2142.82
    assert kpis["total_quantity"] > 0
    assert kpis["comparison_period_label"] is not None

def test_filtering_consistency():
    """Verifies that regional filter updates KPIs, time series, and breakdowns consistently."""
    client.delete("/api/datasets/current")
    response = client.get("/api/analytics/dashboard?region=West")
    assert response.status_code == 200
    data = response.json()
    
    # Regional breakdown must contain only West
    assert len(data["regional_breakdown"]) == 1
    assert data["regional_breakdown"][0]["region"].lower() == "west"
    west_sales = data["regional_breakdown"][0]["sales"]
    west_profit = data["regional_breakdown"][0]["profit"]
    
    # Total revenue in filtered KPIs must match regional breakdown sum
    assert data["kpis"]["total_revenue"] == round(west_sales, 2)
    assert data["kpis"]["total_profit"] == round(west_profit, 2)

def test_dynamic_chart_aggregations():
    """Verifies that chart builder parses natural language aggregation correctly."""
    # Test average aggregation
    avg_res = client.post(
        "/api/analytics/generate-chart",
        json={"query": "Average profit by category", "chart_type": "bar"}
    )
    assert avg_res.status_code == 200
    avg_data = avg_res.json()
    assert "Average" in avg_data["title"]
    assert len(avg_data["data"]) > 0

    # Test count aggregation
    count_res = client.post(
        "/api/analytics/generate-chart",
        json={"query": "Count of orders by region", "chart_type": "bar"}
    )
    assert count_res.status_code == 200
    count_data = count_res.json()
    assert "Count" in count_data["title"]

def test_quality_score_formula_and_completeness():
    """Verifies the documented formula: quality_score = max(0, round(100 - (missing / total_cells * 100), 1))."""
    client.delete("/api/datasets/current")
    response = client.get("/api/analytics/profile")
    assert response.status_code == 200
    data = response.json()
    
    total_cells = data["total_cells"]
    total_missing = data["total_missing_cells"]
    expected_score = max(0.0, round(100.0 - (total_missing / total_cells * 100), 1))
    
    assert data["quality_score"] == expected_score
    assert data["completeness_pct"] == round(((total_cells - total_missing) / total_cells * 100), 2)
    assert "formula_documentation" in data

def test_empty_filter_safety():
    """Ensures non-matching filters return safe zero values without division by zero errors."""
    response = client.get("/api/analytics/dashboard?region=NonExistentRegion12345")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_revenue"] == 0.0
    assert data["kpis"]["total_profit"] == 0.0
    assert data["kpis"]["profit_margin_pct"] == 0.0
    assert data["kpis"]["average_order_value"] == 0.0
    assert data["total_rows"] == 0





