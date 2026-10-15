"""
InsightFlow AI — Business Intelligence Copilot
Main Streamlit Application
"""

import os
import streamlit as st
import pandas as pd
import numpy as np

# Core Modules
from core.data_loader import load_dataset
from core.data_quality import DataQualityEngine
from core.query_engine import QueryEngine
from core.visualizer import generate_chart, build_auto_dashboard
from core.forecaster import Forecaster
from core.anomaly_detector import AnomalyDetector
from core.report_generator import ReportGenerator
from database.db import DatabaseEngine
from ai.schema_extractor import extract_schema_summary
from ai.llm_client import LLMClient

# Page Configuration
st.set_page_config(
    page_title="InsightFlow AI — BI Copilot",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E3A8A;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #4B5563;
        margin-bottom: 1.2rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #E2E8F0;
        text-align: center;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)


# Session State Initialization
if "raw_df" not in st.session_state:
    st.session_state.raw_df = None
if "cleaned_df" not in st.session_state:
    st.session_state.cleaned_df = None
if "db_engine" not in st.session_state:
    st.session_state.db_engine = DatabaseEngine()
if "cleaning_log" not in st.session_state:
    st.session_state.cleaning_log = []
if "dataset_name" not in st.session_state:
    st.session_state.dataset_name = "superstore_sales.csv"


# ---------------- SIDEBAR ----------------
with st.sidebar:
    st.markdown("### ⚡ InsightFlow AI")
    st.caption("Autonomous Business Intelligence Copilot")
    st.divider()

    st.subheader("1. Ingest Dataset")
    uploaded_file = st.file_uploader("Upload CSV or Excel", type=["csv", "xlsx", "xls"])

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        load_demo = st.button("📊 Load Demo", use_container_width=True)
    with col_btn2:
        reset_btn = st.button("🔄 Reset", use_container_width=True)

    if reset_btn:
        st.session_state.raw_df = None
        st.session_state.cleaned_df = None
        st.session_state.cleaning_log = []
        st.rerun()

    sample_path = os.path.join(os.path.dirname(__file__), "sample_data", "superstore_sales.csv")

    if load_demo and os.path.exists(sample_path):
        df, meta = load_dataset(sample_path)
        st.session_state.raw_df = df
        st.session_state.cleaned_df = df.copy()
        st.session_state.dataset_name = "Superstore Sales (Demo)"
        st.session_state.db_engine.register_dataframe(df)
        st.success("Loaded benchmark retail dataset!")

    elif uploaded_file is not None and (st.session_state.raw_df is None or st.session_state.dataset_name != uploaded_file.name):
        df, meta = load_dataset(uploaded_file, filename=uploaded_file.name)
        st.session_state.raw_df = df
        st.session_state.cleaned_df = df.copy()
        st.session_state.dataset_name = uploaded_file.name
        st.session_state.db_engine.register_dataframe(df)
        st.success(f"Loaded {meta['rows']:,} rows from {uploaded_file.name}")

    st.divider()
    st.subheader("2. AI Copilot Engine")
    ai_provider = st.selectbox("AI Model Provider", ["Gemini API", "Offline Heuristic (Rule-Based)", "OpenAI API"])
    api_key = ""
    if ai_provider == "Gemini API":
        api_key = st.text_input("Gemini API Key (optional)", type="password", help="Leave blank to use environment key or offline fallback.")
    elif ai_provider == "OpenAI API":
        api_key = st.text_input("OpenAI API Key", type="password")

    st.divider()
    st.markdown("""
    **Project Highlights for Viva:**
    - 🛡️ Safe JSON query AST (No code injection)
    - ⚡ DuckDB In-Memory OLAP execution
    - 📈 Chronological time-series forecasting
    - 🚨 Statistical Outlier Radar (μ ± 3σ, IQR)
    """)


# ---------------- MAIN CONTENT ----------------
st.markdown('<div class="main-title">InsightFlow AI — Business Intelligence Copilot</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Upload Excel/CSV datasets, query with natural language, auto-generate dashboards, forecast revenue, and export executive reports.</div>', unsafe_allow_html=True)

if st.session_state.cleaned_df is None:
    st.info("👈 **Get Started:** Click **'Load Demo'** in the sidebar or upload your own CSV/Excel spreadsheet to begin.")
    st.stop()

# If st.stop() didn't halt (e.g., bare module import), fallback safely
df_active = st.session_state.cleaned_df if st.session_state.cleaned_df is not None else pd.DataFrame()

# Tabbed Interface
tab_quality, tab_copilot, tab_dashboard, tab_forecast, tab_anomaly, tab_reports = st.tabs([
    "📁 Data Quality & Cleanse",
    "💬 AI Copilot & Query",
    "📊 Auto Dashboard",
    "📈 Sales Forecasting",
    "🚨 Anomaly Radar",
    "📄 Executive Reports"
])


# ==========================================
# TAB 1: DATA QUALITY & CLEANSE
# ==========================================
with tab_quality:
    st.subheader("Data Hygiene Diagnostic & Automated Cleaning")
    
    source_df = st.session_state.raw_df if st.session_state.raw_df is not None else df_active
    dq_engine = DataQualityEngine(source_df)
    profile = dq_engine.profile()

    # High-level KPIs
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Dataset Rows", f"{profile['total_rows']:,}")
    c2.metric("Total Columns", profile["total_cols"])
    c3.metric("Missing Cells", f"{profile['total_nulls']} ({profile['null_percentage']}%)")
    c4.metric("Duplicate Rows", profile["duplicate_rows"])
    health_delta = "Clean" if profile["health_score"] > 85 else "Needs Cleaning"
    c5.metric("Health Score", f"{profile['health_score']} / 100", delta=health_delta)

    # Automated Issue Detection Callout
    issues = []
    if profile["disguised_numerics"]:
        issues.append(f"Disguised numeric string columns: **{', '.join(profile['disguised_numerics'])}**")
    if profile["potential_dates"]:
        issues.append(f"Unparsed date columns: **{', '.join(profile['potential_dates'])}**")
    if profile["duplicate_rows"] > 0:
        issues.append(f"Found **{profile['duplicate_rows']}** exact duplicate row(s).")
    if profile["total_nulls"] > 0:
        issues.append(f"Found **{profile['total_nulls']}** missing values across columns.")

    if issues:
        with st.expander("⚠️ Data Quality Alerts Detected", expanded=True):
            for iss in issues:
                st.markdown(f"- {iss}")

    # Cleaning Controls
    st.markdown("#### 🛠️ Configure Cleaning Pipeline")
    clean_c1, clean_c2, clean_c3, clean_c4 = st.columns(4)
    with clean_c1:
        opt_trim = st.checkbox("Trim Whitespace & Snake_case", value=True)
    with clean_c2:
        opt_dup = st.checkbox("Drop Exact Duplicates", value=True)
    with clean_c3:
        opt_num = st.checkbox("Sanitize Disguised Numerics", value=True)
    with clean_c4:
        opt_date = st.checkbox("Parse Datetime Formats", value=True)

    impute_choice = st.selectbox(
        "Missing Value Treatment Strategy",
        ["Keep missing as is", "Impute (Median for numbers, Mode for text)", "Drop rows with missing values"]
    )
    impute_map = {
        "Keep missing as is": "none",
        "Impute (Median for numbers, Mode for text)": "median_mode",
        "Drop rows with missing values": "drop_rows"
    }

    if st.button("🚀 Apply Cleaning Pipeline", type="primary"):
        cleaned, log = dq_engine.clean_dataset(
            strip_whitespace=opt_trim,
            drop_duplicates=opt_dup,
            convert_dates=opt_date,
            convert_numerics=opt_num,
            impute_strategy=impute_map[impute_choice]
        )
        st.session_state.cleaned_df = cleaned
        st.session_state.cleaning_log = log
        st.session_state.db_engine.register_dataframe(cleaned)
        st.success("Cleaning pipeline executed and registered to database!")
        st.rerun()

    if st.session_state.cleaning_log:
        st.info(" **Recent Cleaning Audit Log:**\n- " + "\n- ".join(st.session_state.cleaning_log))

    # Dataset Preview
    st.markdown("#### 🔍 Dataset Inspector")
    st.dataframe(df_active.head(20), use_container_width=True)

    with st.expander("📋 Column-Level Metadata & Data Types"):
        st.dataframe(pd.DataFrame(profile["columns_info"]), use_container_width=True)


# ==========================================
# TAB 2: AI COPILOT & QUERY ENGINE
# ==========================================
with tab_copilot:
    st.subheader("💬 Natural Language Business Copilot")
    st.caption("Ask questions in plain English. InsightFlow AI constructs a deterministic query plan, runs safe SQL, and renders interactive charts.")

    # Suggestion Chips
    st.markdown("**Sample Questions (Click to ask):**")
    chip_cols = st.columns(4)
    preset_q = None
    if chip_cols[0].button("Which region has highest profit?"):
        preset_q = "Which region has highest profit?"
    if chip_cols[1].button("Top 5 products by sales"):
        preset_q = "Top 5 products by sales"
    if chip_cols[2].button("Average sales by category"):
        preset_q = "Average sales by category"
    if chip_cols[3].button("What is the total revenue?"):
        preset_q = "What is the total revenue?"

    user_query = st.text_input("Enter your business question:", value=preset_q or "", placeholder="e.g. Which customer segment yields the highest profit?")

    if st.button("⚡ Ask Copilot", type="primary") or preset_q:
        if not user_query.strip():
            st.warning("Please enter a question.")
        else:
            with st.spinner("Analyzing schema and translating question into query plan..."):
                schema_info = extract_schema_summary(df_active)
                llm = LLMClient(
                    gemini_api_key=api_key if ai_provider == "Gemini API" else None,
                    openai_api_key=api_key if ai_provider == "OpenAI API" else None,
                    preferred_provider="gemini" if ai_provider == "Gemini API" else ("openai" if ai_provider == "OpenAI API" else "heuristic")
                )

                plan = llm.query_copilot(user_query, schema_info)
                q_engine = QueryEngine(df_active)
                res_df, latency_ms, stats = q_engine.execute_plan(plan)

                # Execute SQL via DuckDB
                sql_df, sql_latency, sql_err = st.session_state.db_engine.execute_query(plan.get("sql_query", ""))

            st.success(f" Query answered in **{latency_ms} ms** | SQL Execution: **{sql_latency} ms**")

            # Explanation Callout
            st.info(f"💡 **Business Takeaway:** {plan.get('explanation', 'Analysis completed.')}")

            # Visualization & Data
            viz_col, code_col = st.columns([3, 2])
            with viz_col:
                st.markdown("#### 📊 Interactive Visualization")
                fig = generate_chart(
                    res_df,
                    chart_type=plan.get("chart_type", "bar"),
                    title=plan.get("title", user_query)
                )
                st.plotly_chart(fig, use_container_width=True)

            with code_col:
                st.markdown("#### 🛡️ Generated Query Plan")
                with st.expander("Structured JSON Query AST", expanded=True):
                    st.json(plan)
                with st.expander("Safe DuckDB / SQL Equivalent", expanded=True):
                    st.code(plan.get("sql_query", ""), language="sql")

            st.markdown("#### 📋 Results Table")
            st.dataframe(res_df, use_container_width=True)


# ==========================================
# TAB 3: AUTO DASHBOARD
# ==========================================
with tab_dashboard:
    st.subheader("📊 Auto-Generated Executive BI Dashboard")
    st.caption("Automatic metric discovery and interactive visual breakdown.")

    auto_dash = build_auto_dashboard(df_active)

    # Render Executive KPIs
    kpis = auto_dash.get("kpis", {})
    if kpis:
        kpi_cols = st.columns(len(kpis))
        for col, (title, val) in zip(kpi_cols, kpis.items()):
            col.metric(title, val)
    st.divider()

    # Render Auto-Charts
    charts = auto_dash.get("charts", {})
    if charts:
        if "trend" in charts:
            st.plotly_chart(charts["trend"], use_container_width=True)

        chart_c1, chart_c2 = st.columns(2)
        if "region" in charts:
            chart_c1.plotly_chart(charts["region"], use_container_width=True)
        if "category" in charts:
            chart_c2.plotly_chart(charts["category"], use_container_width=True)
    else:
        st.info("No suitable numeric or categorical fields detected to build auto-dashboard.")


# ==========================================
# TAB 4: SALES FORECASTING
# ==========================================
with tab_forecast:
    st.subheader("📈 Time-Series Predictive Forecasting")
    st.caption("Chronological time-series modeling with 95% confidence bounds and leak-free backtesting.")

    # Identify potential date and numeric columns
    dt_cols = df_active.select_dtypes(include=["datetime64"]).columns.tolist()
    all_date_candidates = [c for c in df_active.columns if "date" in c.lower() or "time" in c.lower()] + dt_cols
    all_date_candidates = list(dict.fromkeys(all_date_candidates))

    num_cols = df_active.select_dtypes(include=["number"]).columns.tolist()

    if not all_date_candidates or not num_cols:
        st.warning("Forecasting requires at least one date column and one numeric column.")
    else:
        fc_c1, fc_c2, fc_c3, fc_c4 = st.columns(4)
        with fc_c1:
            sel_date = st.selectbox("Date Column", all_date_candidates, index=0)
        with fc_c2:
            default_metric_idx = next((i for i, c in enumerate(num_cols) if "sale" in c.lower() or "rev" in c.lower()), 0)
            sel_metric = st.selectbox("Metric Column", num_cols, index=default_metric_idx)
        with fc_c3:
            horizon = st.slider("Forecast Horizon (Days)", min_value=7, max_value=90, value=30, step=7)
        with fc_c4:
            freq = st.selectbox("Granularity", ["Daily (D)", "Weekly (W)", "Monthly (M)"])
            freq_code = "D" if "Daily" in freq else ("W" if "Weekly" in freq else "M")

        if st.button("🚀 Generate Forecast", type="primary"):
            try:
                forecaster = Forecaster(df_active, date_col=sel_date, metric_col=sel_metric, freq=freq_code)
                forecast_df, metrics, fig_fc = forecaster.train_and_forecast(horizon=horizon)

                # Store metrics in session state for reports
                st.session_state.forecast_metrics = metrics

                st.plotly_chart(fig_fc, use_container_width=True)

                # Accuracy Metrics
                st.markdown("#### 🎯 Chronological Backtesting Accuracy Metrics")
                m1, m2, m3 = st.columns(3)
                m1.metric("Mean Absolute Error (MAE)", f"{metrics['MAE']:,.2f}")
                m2.metric("Root Mean Squared Error (RMSE)", f"{metrics['RMSE']:,.2f}")
                m3.metric("Mean Absolute Percentage Error (MAPE)", f"{metrics['MAPE']:.2f}%")

                st.markdown("#### 📋 Forecast Data Table")
                st.dataframe(forecast_df, use_container_width=True)

            except Exception as e:
                st.error(f"Forecasting error: {str(e)}")


# ==========================================
# TAB 5: ANOMALY RADAR
# ==========================================
with tab_anomaly:
    st.subheader("🚨 Anomaly & Outlier Radar")
    st.caption("Surveillance radar tracking statistical anomalies and unexpected drops/spikes.")

    if not num_cols:
        st.warning("Anomaly detection requires at least one numeric metric.")
    else:
        anom_c1, anom_c2, anom_c3 = st.columns(3)
        with anom_c1:
            anom_metric = st.selectbox("Metric to Monitor", num_cols, index=0)
        with anom_c2:
            anom_date = st.selectbox("Order / Time Sequence", ["None"] + all_date_candidates)
            anom_date_col = None if anom_date == "None" else anom_date
        with anom_c3:
            sigma_thresh = st.slider("Alert Sensitivity (Sigma threshold)", min_value=2.0, max_value=4.0, value=3.0, step=0.5)

        detector = AnomalyDetector(df_active, metric_col=anom_metric, date_col=anom_date_col)
        anomalies_df, summary, fig_anom = detector.detect_zscore(threshold_sigma=sigma_thresh)

        # Store for reports
        st.session_state.anomalies_summary = summary

        st.plotly_chart(fig_anom, use_container_width=True)

        # Summary KPIs
        sk1, sk2, sk3, sk4 = st.columns(4)
        sk1.metric("Evaluated Records", summary["total_evaluated"])
        sk2.metric("Anomalies Flagged", summary["anomaly_count"])
        sk3.metric("Anomaly Rate", f"{summary['anomaly_percentage']}%")
        sk4.metric("Extreme Spike", f"{summary.get('max_spike', 0):,.2f}")

        if not anomalies_df.empty:
            st.markdown("#### ⚠️ Flagged Outlier Records")
            st.dataframe(anomalies_df.drop(columns=["is_anomaly", "upper_bound", "lower_bound"], errors="ignore"), use_container_width=True)


# ==========================================
# TAB 6: EXECUTIVE REPORTS
# ==========================================
with tab_reports:
    st.subheader("📄 Automated Business Report Generator")
    st.caption("Compile your insights, health scores, KPIs, and machine learning models into exportable executive PDF or Word documents.")

    auto_dash = build_auto_dashboard(df_active)
    source_df = st.session_state.raw_df if st.session_state.raw_df is not None else df_active
    dq_engine = DataQualityEngine(source_df)
    profile = dq_engine.profile()

    kpis = auto_dash.get("kpis", {})
    forecast_metrics = getattr(st.session_state, "forecast_metrics", {})
    anomalies_summary = getattr(st.session_state, "anomalies_summary", {})

    reporter = ReportGenerator(
        dataset_name=st.session_state.dataset_name,
        quality_summary=profile,
        kpis=kpis,
        anomalies_summary=anomalies_summary,
        forecast_metrics=forecast_metrics
    )

    r_c1, r_c2, r_c3 = st.columns(3)

    with r_c1:
        st.markdown("#### 📕 Executive PDF Report")
        st.write("Formal PDF containing executive KPIs, data quality health scorecard, and ML findings.")
        pdf_bytes = reporter.generate_pdf()
        st.download_button(
            label="📥 Download PDF Report",
            data=pdf_bytes,
            file_name=f"InsightFlow_Report_{st.session_state.dataset_name}.pdf",
            mime="application/pdf",
            use_container_width=True
        )

    with r_c2:
        st.markdown("#### 📘 Word Document (.docx)")
        st.write("Editable Word document formatted for project reports and academic submissions.")
        docx_bytes = reporter.generate_docx()
        st.download_button(
            label="📥 Download Word (.docx)",
            data=docx_bytes,
            file_name=f"InsightFlow_Report_{st.session_state.dataset_name}.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            use_container_width=True
        )

    with r_c3:
        st.markdown("#### 📗 Cleaned Dataset Export")
        st.write("Export the cleaned, standardized dataset to CSV for downstream BI tools.")
        csv_bytes = df_active.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="📥 Download Cleaned CSV",
            data=csv_bytes,
            file_name=f"Cleaned_{st.session_state.dataset_name}.csv",
            mime="text/csv",
            use_container_width=True
        )

