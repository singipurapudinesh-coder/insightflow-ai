# InsightFlow AI — API Contract Documentation

Base URL: `http://localhost:8000/api`

---

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns server readiness, environment status, and sample dataset availability.
- **Response**:
```json
{
  "status": "healthy",
  "app_name": "InsightFlow AI API",
  "environment": "development",
  "version": "1.0.0",
  "timestamp": "2026-10-15T14:35:00Z",
  "sample_data_ready": true,
  "details": {
    "database": "supabase_configured",
    "llm_provider": "gemini",
    "cors_configured": true
  }
}
```

---

### 2. Dashboard Analytics
- **Endpoint**: `GET /api/analytics/dashboard`
- **Query Parameters**:
  - `region` (optional): Filter by territory (e.g. `West`, `Central`).
  - `category` (optional): Filter by category (e.g. `Technology`).
  - `start_date` (optional): `YYYY-MM-DD`.
  - `end_date` (optional): `YYYY-MM-DD`.
- **Response**:
```json
{
  "kpis": {
    "total_revenue": 1285690.47,
    "total_profit": 161473.74,
    "profit_margin_pct": 12.56,
    "total_orders": 600,
    "average_order_value": 2142.82,
    "total_quantity": 3240,
    "revenue_growth_pct": 14.8,
    "profit_growth_pct": 18.2
  },
  "time_series": [
    { "date": "2025-01", "sales": 185420.12, "profit": 24150.30, "orders": 85 }
  ],
  "category_breakdown": [
    { "category": "Technology", "sales": 542910.8, "profit": 89450.2, "margin_pct": 16.48, "orders": 195 }
  ],
  "regional_breakdown": [
    { "region": "West", "sales": 412500.5, "profit": 58400.2, "orders": 180 }
  ],
  "dataset_name": "Superstore Sales Sample",
  "total_rows": 600,
  "available_filters": {
    "regions": ["Central", "East", "South", "West"],
    "categories": ["Furniture", "Office Supplies", "Technology"]
  }
}
```

---

### 3. Data Profiling & Quality
- **Endpoint**: `GET /api/analytics/profile`
- **Description**: Returns column schema details, missing percentages, and uniqueness metrics.

---

### 4. AI Copilot Query
- **Endpoint**: `POST /api/copilot/query`
- **Request Body**:
```json
{
  "question": "Which region has the highest profit?"
}
```
- **Response**:
```json
{
  "answer": "Based on the sales dataset analysis, the West region generated the highest overall profit...",
  "confidence": 0.95,
  "suggested_chart": "bar",
  "dimensions": ["region", "profit"],
  "model_used": "InsightFlow-Deterministic-BI"
}
```

---

### 5. Forecasting Baseline
- **Endpoint**: `GET /api/forecasts/baseline?periods=6`
- **Description**: Linear trend projection with model R² score.

