# InsightFlow AI — Architecture & Engineering Specification

## 1. System Overview
**InsightFlow AI** is a production-oriented Business Intelligence Copilot that empowers analysts, executives, and data practitioners to upload tabular data (CSV/Excel), perform automated data-quality audits, view dynamic KPI dashboards, forecast trends using machine learning, and converse with a grounded AI copilot.

```
┌────────────────────────────────────────────────────────┐
│                   User's Browser                       │
│    (Next.js 16 + React 19 + TypeScript + Recharts)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (CORS)
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Backend Analytics Engine           │
│   - Data Ingestion & Sanitization                      │
│   - Pandas & NumPy Dynamic KPI Aggregation             │
│   - Scikit-learn Linear Trend Forecasting              │
│   - Grounded Analytical AI Copilot                     │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐
│  Supabase PostgreSQL │        │  LLM Provider        │
│  (Auth, Preferences) │        │  (Gemini 2.5 Flash)  │
└──────────────────────┘        └──────────────────────┘
```

## 2. Decoupled Cloud Architecture
- **Frontend Host**: Vercel (Next.js App Router, SSR/SSG, edge routing, responsive Tailwind CSS).
- **Backend Host**: Render (FastAPI ASGI service running on Python 3.11+, unconstrained ML computation).
- **Database & Auth**: Supabase PostgreSQL with Row-Level Security (RLS).
- **LLM Reasoning**: Google Gemini API via official `google-genai` SDK.

## 3. Security & Data Integrity
1. **No Code Execution**: User input never gets passed to `exec()`, `eval()`, or raw unsanitized SQL.
2. **File Validation**: Strict 25 MB payload limit with file extension and MIME type verification.
3. **Column Sanitization**: Automated regex cleaning of headers to prevent prototype pollution or JSON serialization errors.
4. **Credential Isolation**: Privileged secrets (`SUPABASE_SERVICE_ROLE_KEY`, `LLM_API_KEY`) reside exclusively in server-side environment variables.

