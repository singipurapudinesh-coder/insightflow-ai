# ⚡ InsightFlow AI — Business Intelligence Copilot

> **An enterprise-grade, AI-powered Business Intelligence web platform that transforms raw spreadsheets (CSV/Excel) into dynamic KPI dashboards, grounded natural language insights, and machine learning forecasts.**

---

## 🌟 Key Features

- **📊 Dynamic Analytics Engine**: Real-time KPI aggregation (Revenue, Profit, Margin, Order Volume, AOV) computed via Pandas & NumPy — with zero hardcoded values.
- **🤖 Grounded AI Copilot**: Ask questions in plain English (*"Which region has the highest profit?"*) and receive grounded analytical answers with chart recommendations.
- **📈 Interactive Visualizations**: Historical revenue/profit trend area charts, regional territory comparisons, and category performance breakdown powered by Recharts.
- **🔍 Data Quality Profiling**: Automatic schema inference, missing value audits, column types, and data hygiene scoring.
- **🔮 Predictive Analytics**: Baseline machine learning trend forecasting and growth projections powered by Scikit-learn.
- **☁️ Cloud-Ready Architecture**: Designed for decoupled deployment with Next.js on **Vercel** and FastAPI on **Render**.

---

## 🏛️ Project Structure

```
InsightFlow-AI/
├── frontend/                     # Next.js 16 + React 19 + TypeScript + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx              # Modern SaaS Landing Page
│   │   ├── dashboard/page.tsx    # Executive BI Dashboard with live metrics
│   │   ├── analyze/page.tsx      # Data profiling & dataset explorer
│   │   ├── copilot/page.tsx      # Grounded AI Copilot Chat Interface
│   │   ├── reports/page.tsx      # Executive BI performance reports
│   │   ├── settings/page.tsx     # System & LLM configurations
│   │   ├── layout.tsx            # Global layout with Navbar & Metadata
│   │   └── globals.css
│   ├── components/               # Navbar, Sidebar, KPICards, DashboardCharts
│   ├── lib/
│   │   ├── api.ts                # Strongly typed REST client for FastAPI
│   │   └── utils.ts              # Currency, percent, and formatting utilities
│   ├── package.json
│   └── .env.example
│
├── backend/                      # Python FastAPI + Pandas + Scikit-learn
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, CORS & /api/health
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic Settings configuration
│   │   │   └── security.py       # Upload validation and payload safeguards
│   │   ├── api/routes/
│   │   │   ├── analytics.py      # /api/analytics/dashboard & /api/analytics/profile
│   │   │   ├── datasets.py       # /api/datasets/current & upload
│   │   │   ├── copilot.py        # /api/copilot/query (grounded NL questions)
│   │   │   ├── forecasts.py      # /api/forecasts/baseline (Scikit-learn trend)
│   │   │   └── reports.py        # /api/reports/summary
│   │   ├── services/
│   │   │   ├── data_loader.py    # Safe CSV/XLSX loading & cleaning
│   │   │   ├── analytics_engine.py # Real KPI computation and aggregation
│   │   │   ├── chart_service.py  # Plotly specification generators
│   │   │   ├── ai_service.py     # Grounded analytical reasoning
│   │   │   └── forecast_service.py # ML trend model
│   │   └── schemas/              # Pydantic contract models
│   ├── tests/                    # Automated pytest test suite
│   ├── requirements.txt
│   └── .env.example
│
├── sample_data/
│   └── sales_sample.csv          # Superstore business sales dataset (600 rows)
├── docs/
│   ├── architecture.md           # System design & Vercel/Render architecture
│   └── api.md                    # Typed API contract specifications
└── README.md
```

---

## 🚀 Local Development Setup

### Terminal 1: Python Backend (FastAPI)
```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### Terminal 2: Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` in your browser.

---

## 🧪 Testing Backend
Run the automated pytest test suite:
```bash
py -m pytest backend/tests -v
```

---

## 🌐 Production Deployment

- **Frontend (Vercel)**:
  1. Import repository on Vercel.
  2. Set Root Directory to `frontend`.
  3. Configure environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`.
- **Backend (Render)**:
  1. Create a Web Service with Root Directory set to `backend`.
  2. Build Command: `pip install -r requirements.txt`.
  3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
