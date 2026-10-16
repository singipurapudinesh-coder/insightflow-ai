import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.schemas.analytics import (
    KPISummary,
    TimeSeriesPoint,
    CategoryBreakdown,
    RegionalBreakdown,
    DashboardDataResponse,
    DatasetProfileResponse,
    ColumnInfo,
    DatasetCapabilitiesResponse,
    DynamicChartResponse
)

class AnalyticsEngine:
    @staticmethod
    def calculate_dashboard_data(
        df: pd.DataFrame,
        region: Optional[str] = None,
        category: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> DashboardDataResponse:
        filtered_df = df.copy()

        # Apply region filter if specified
        if region and "region" in filtered_df.columns and region.lower() != "all":
            filtered_df = filtered_df[filtered_df["region"].astype(str).str.lower() == region.lower()]

        # Apply category filter if specified
        if category and "category" in filtered_df.columns and category.lower() != "all":
            filtered_df = filtered_df[filtered_df["category"].astype(str).str.lower() == category.lower()]

        # Date column handling
        date_col = next((c for c in ["order_date", "date", "timestamp"] if c in filtered_df.columns), None)
        if date_col and (start_date or end_date):
            if start_date:
                filtered_df = filtered_df[filtered_df[date_col] >= pd.to_datetime(start_date)]
            if end_date:
                filtered_df = filtered_df[filtered_df[date_col] <= pd.to_datetime(end_date)]

        # Smart detection of columns for arbitrary CSV/Excel uploads
        sales_col = next((c for c in ["sales", "revenue", "amount", "total", "price", "value", "balance", "cost", "total_sales"] if c in filtered_df.columns), None)
        if not sales_col:
            num_cols = filtered_df.select_dtypes(include=[np.number]).columns.tolist()
            if num_cols:
                sales_col = num_cols[0]

        profit_col = next((c for c in ["profit", "net_profit", "margin", "income", "gain", "net_amount"] if c in filtered_df.columns), None)
        if not profit_col:
            num_cols = [c for c in filtered_df.select_dtypes(include=[np.number]).columns if c != sales_col]
            if num_cols:
                profit_col = num_cols[0]

        qty_col = next((c for c in ["quantity", "qty", "units", "count", "items"] if c in filtered_df.columns), None)
        order_col = next((c for c in ["order_id", "id", "transaction_id", "invoice_id", "row_id"] if c in filtered_df.columns), None)

        total_sales = float(filtered_df[sales_col].sum()) if sales_col and not filtered_df.empty else 0.0
        total_profit = float(filtered_df[profit_col].sum()) if profit_col and not filtered_df.empty else 0.0
        
        # Distinct order count handling missing or whitespace IDs safely
        if order_col and not filtered_df.empty:
            valid_orders = filtered_df[order_col].dropna().astype(str).str.strip()
            valid_orders = valid_orders[valid_orders != ""]
            total_orders = int(valid_orders.nunique())
        else:
            total_orders = len(filtered_df)

        total_quantity = int(filtered_df[qty_col].sum()) if qty_col and not filtered_df.empty else len(filtered_df)
        
        profit_margin = round((total_profit / total_sales * 100), 2) if total_sales > 0 else 0.0
        aov = round((total_sales / total_orders), 2) if total_orders > 0 else 0.0

        # Calculate Growth (Compare chronological first half of time range to second half)
        growth_pct = None
        profit_growth_pct = None
        comparison_label = None
        baseline_desc = None

        if date_col and not filtered_df.empty and filtered_df[date_col].notnull().sum() > 4:
            clean_date_df = filtered_df.dropna(subset=[date_col]).sort_values(date_col)
            midpoint = len(clean_date_df) // 2
            if midpoint > 0:
                first_half = clean_date_df.iloc[:midpoint]
                second_half = clean_date_df.iloc[midpoint:]

                first_half_sales = float(first_half[sales_col].sum()) if sales_col else 0.0
                second_half_sales = float(second_half[sales_col].sum()) if sales_col else 0.0
                if first_half_sales > 0:
                    growth_pct = round(((second_half_sales - first_half_sales) / first_half_sales) * 100, 2)

                first_half_profit = float(first_half[profit_col].sum()) if profit_col else 0.0
                second_half_profit = float(second_half[profit_col].sum()) if profit_col else 0.0
                if first_half_profit != 0:
                    profit_growth_pct = round(((second_half_profit - first_half_profit) / abs(first_half_profit)) * 100, 2)

                try:
                    d1_start = first_half[date_col].min().strftime("%b %Y")
                    d1_end = first_half[date_col].max().strftime("%b %Y")
                    d2_start = second_half[date_col].min().strftime("%b %Y")
                    d2_end = second_half[date_col].max().strftime("%b %Y")
                    comparison_label = f"{d2_start}–{d2_end} vs {d1_start}–{d1_end}"
                    baseline_desc = f"Comparing chronological H2 ({d2_start}–{d2_end}) to baseline H1 ({d1_start}–{d1_end})"
                except Exception:
                    comparison_label = "Recent half vs prior period"
                    baseline_desc = "Comparing recent half of chronological records to prior baseline"

        kpis = KPISummary(
            total_revenue=round(total_sales, 2),
            total_profit=round(total_profit, 2),
            profit_margin_pct=profit_margin,
            total_orders=total_orders,
            average_order_value=aov,
            total_quantity=total_quantity,
            revenue_growth_pct=growth_pct,
            profit_growth_pct=profit_growth_pct,
            comparison_period_label=comparison_label,
            baseline_description=baseline_desc
        )

        # Time-series aggregation
        time_series: List[TimeSeriesPoint] = []
        if date_col and not filtered_df.empty:
            ts_df = filtered_df.dropna(subset=[date_col]).copy()
            # Group by Month-Year or Date
            ts_df["period"] = ts_df[date_col].dt.strftime("%Y-%m")
            grouped = ts_df.groupby("period").agg(
                sales=(sales_col, "sum") if sales_col else (date_col, "count"),
                profit=(profit_col, "sum") if profit_col else (date_col, "count"),
                orders=(order_col, "nunique") if order_col else (date_col, "count")
            ).reset_index().sort_values("period")

            for _, row in grouped.iterrows():
                time_series.append(TimeSeriesPoint(
                    date=str(row["period"]),
                    sales=round(float(row["sales"]), 2),
                    profit=round(float(row["profit"]), 2),
                    orders=int(row["orders"])
                ))

        # Category Breakdown
        categories: List[CategoryBreakdown] = []
        cat_col = next((c for c in ["category", "product_category", "department", "segment", "type", "product", "item"] if c in filtered_df.columns), None)
        if not cat_col:
            text_cols = filtered_df.select_dtypes(include=["object", "string"]).columns.tolist()
            for tc in text_cols:
                if 1 < filtered_df[tc].nunique() <= 30:
                    cat_col = tc
                    break

        if cat_col and not filtered_df.empty:
            cat_grouped = filtered_df.groupby(cat_col).agg(
                sales=(sales_col, "sum") if sales_col else (cat_col, "count"),
                profit=(profit_col, "sum") if profit_col else (cat_col, "count"),
                orders=(order_col, "nunique") if order_col else (cat_col, "count")
            ).reset_index()

            for _, row in cat_grouped.iterrows():
                c_sales = float(row["sales"])
                c_profit = float(row["profit"])
                c_margin = round((c_profit / c_sales * 100), 2) if c_sales > 0 else 0.0
                categories.append(CategoryBreakdown(
                    category=str(row[cat_col]),
                    sales=round(c_sales, 2),
                    profit=round(c_profit, 2),
                    margin_pct=c_margin,
                    orders=int(row["orders"])
                ))

        # Regional Breakdown
        regions: List[RegionalBreakdown] = []
        reg_col = next((c for c in ["region", "territory", "zone", "state", "country", "city", "location", "market"] if c in filtered_df.columns), None)
        if not reg_col:
            text_cols = [c for c in filtered_df.select_dtypes(include=["object", "string"]).columns if c != cat_col]
            for tc in text_cols:
                if 1 < filtered_df[tc].nunique() <= 30:
                    reg_col = tc
                    break

        if reg_col and not filtered_df.empty:
            reg_grouped = filtered_df.groupby(reg_col).agg(
                sales=(sales_col, "sum") if sales_col else (reg_col, "count"),
                profit=(profit_col, "sum") if profit_col else (reg_col, "count"),
                orders=(order_col, "nunique") if order_col else (reg_col, "count")
            ).reset_index()

            for _, row in reg_grouped.iterrows():
                regions.append(RegionalBreakdown(
                    region=str(row[reg_col]),
                    sales=round(float(row["sales"]), 2),
                    profit=round(float(row["profit"]), 2),
                    orders=int(row["orders"])
                ))

        # Available filters
        available_filters = {
            "regions": sorted([str(r) for r in df[reg_col].dropna().unique().tolist()][:25]) if reg_col and reg_col in df.columns else [],
            "categories": sorted([str(c) for c in df[cat_col].dropna().unique().tolist()][:25]) if cat_col and cat_col in df.columns else []
        }

        # Dynamic metric & dimension labels for title generation
        metric_title = sales_col.replace('_', ' ').title() if sales_col else "Volume"
        secondary_metric_title = profit_col.replace('_', ' ').title() if profit_col else "Net Margin"
        cat_title = cat_col.replace('_', ' ').title() if cat_col else "Category"
        reg_title = reg_col.replace('_', ' ').title() if reg_col else "Territory"

        return DashboardDataResponse(
            kpis=kpis,
            time_series=time_series,
            category_breakdown=categories,
            regional_breakdown=regions,
            dataset_name="Superstore Sales Sample",
            total_rows=len(filtered_df),
            available_filters=available_filters,
            metric_name=metric_title,
            secondary_metric_name=secondary_metric_title,
            category_dim_name=cat_title,
            regional_dim_name=reg_title,
        )

    @staticmethod
    def get_dataset_capabilities(df: pd.DataFrame, filename: str = "dataset.csv") -> DatasetCapabilitiesResponse:
        """Inspects uploaded dataset columns and recommends analytical queries and questions."""
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = [c for c in df.select_dtypes(include=["object", "string"]).columns if df[c].nunique() < 60]
        date_cols = [c for c in df.columns if any(term in c for term in ["date", "time", "year", "month"]) or pd.api.types.is_datetime64_any_dtype(df[c])]

        suggestions = []
        if cat_cols and num_cols:
            suggestions.append(f"Compare {num_cols[0].replace('_', ' ')} across {cat_cols[0].replace('_', ' ')}")
            suggestions.append(f"Show {cat_cols[0].replace('_', ' ')} distribution as a pie chart")
            if len(cat_cols) > 1:
                suggestions.append(f"Which {cat_cols[1].replace('_', ' ')} has the highest {num_cols[0].replace('_', ' ')}?")
            if len(num_cols) > 1:
                suggestions.append(f"Analyze {num_cols[1].replace('_', ' ')} by {cat_cols[0].replace('_', ' ')}")
        if date_cols and num_cols:
            suggestions.append(f"Plot {num_cols[0].replace('_', ' ')} trend over time")
        if cat_cols:
            suggestions.append(f"Breakdown of records by {cat_cols[0].replace('_', ' ')}")

        if not suggestions:
            suggestions = [
                "Summarize key metrics",
                "Show top 5 segments",
                "Distribution of values"
            ]

        overview = f"Dataset '{filename}' loaded with {len(df):,} records and {len(df.columns)} attributes."
        if num_cols:
            overview += f" Measurable metrics: {', '.join([c.replace('_', ' ') for c in num_cols[:4]])}."
        if cat_cols:
            overview += f" Categorical dimensions: {', '.join([c.replace('_', ' ') for c in cat_cols[:4]])}."

        return DatasetCapabilitiesResponse(
            filename=filename,
            row_count=len(df),
            column_count=len(df.columns),
            numeric_columns=num_cols,
            categorical_columns=cat_cols,
            date_columns=date_cols,
            suggested_questions=suggestions[:6],
            overview_summary=overview
        )

    @staticmethod
    def build_dynamic_chart_from_query(df: pd.DataFrame, query: str, preferred_chart_type: Optional[str] = "auto") -> DynamicChartResponse:
        """Parses user's natural language statement and constructs aggregated chart data."""
        q_lower = query.lower()
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = [c for c in df.select_dtypes(include=["object", "string"]).columns if df[c].nunique() < 100]
        date_cols = [c for c in df.columns if any(term in c for term in ["date", "time", "year", "month"]) or pd.api.types.is_datetime64_any_dtype(df[c])]

        # 1. Determine Chart Type
        chart_type = preferred_chart_type if preferred_chart_type and preferred_chart_type != "auto" else None
        if not chart_type or chart_type == "auto":
            if any(term in q_lower for term in ["pie", "donut", "share", "percentage", "proportion"]):
                chart_type = "pie"
            elif any(term in q_lower for term in ["trend", "over time", "monthly", "daily", "timeline", "history"]):
                chart_type = "area" if "area" in q_lower else "line"
            elif "area" in q_lower:
                chart_type = "area"
            else:
                chart_type = "bar"

        # 2. Identify target Y (numeric metric)
        synonyms = {
            "sales": ["sale", "revenue", "amount", "total", "turnover", "volume"],
            "profit": ["margin", "earnings", "net", "gain", "profitability"],
            "quantity": ["qty", "count", "units", "items", "number"],
            "discount": ["rebate", "reduction", "deduction"],
            "price": ["cost", "rate", "fee", "charge"],
        }

        y_col = None
        for col in num_cols:
            c_name = col.lower()
            if c_name in q_lower or c_name.replace("_", " ") in q_lower:
                y_col = col
                break
            for std, alts in synonyms.items():
                if std in c_name and any(alt in q_lower for alt in alts):
                    y_col = col
                    break
            if y_col:
                break
        if not y_col and num_cols:
            y_col = num_cols[0]

        # 3. Identify target X (dimension or date)
        x_col = None
        if (chart_type in ["line", "area"] or "time" in q_lower or "trend" in q_lower) and date_cols:
            x_col = date_cols[0]
        else:
            for col in cat_cols + date_cols:
                c_name = col.lower()
                if c_name in q_lower or c_name.replace("_", " ") in q_lower:
                    x_col = col
                    break
                for std, alts in [("region", ["territory", "state", "city", "country", "location", "area"]),
                                  ("category", ["department", "type", "kind", "class", "group", "product", "item"])]:
                    if std in c_name and any(alt in q_lower for alt in alts):
                        x_col = col
                        break
                if x_col:
                    break

        if not x_col:
            if cat_cols:
                x_col = cat_cols[0]
            elif date_cols:
                x_col = date_cols[0]
                chart_type = "line"
            elif df.columns.size > 0:
                x_col = df.columns[0]
            else:
                x_col = "index"

        # 4. Detect Aggregation Function (Sum, Avg, Count, Min, Max)
        agg_func = "sum"
        agg_label = "Total"
        if any(w in q_lower for w in ["average", "avg", "mean"]):
            agg_func = "mean"
            agg_label = "Average"
        elif any(w in q_lower for w in ["count", "frequency", "transaction count", "orders count"]):
            agg_func = "count"
            agg_label = "Count"
        elif "min" in q_lower or "minimum" in q_lower:
            agg_func = "min"
            agg_label = "Minimum"
        elif "max" in q_lower or "maximum" in q_lower:
            agg_func = "max"
            agg_label = "Maximum"

        # 5. Aggregate data
        if df.empty or not y_col:
            return DynamicChartResponse(
                title=f"Chart for '{query}'",
                description="No matching data available in dataset to plot.",
                chart_type="bar",
                x_key="category",
                y_key="value",
                data=[],
                metrics={},
                insights=["No records match the requested statement."],
                query_echo=query
            )

        working_df = df.dropna(subset=[x_col]).copy() if x_col in df.columns else df.copy()

        # Handle Date Aggregation
        is_date = (x_col in date_cols) or (x_col in working_df.columns and pd.api.types.is_datetime64_any_dtype(working_df[x_col]))
        if is_date and x_col in working_df.columns:
            working_df[x_col] = pd.to_datetime(working_df[x_col], errors="coerce")
            working_df = working_df.dropna(subset=[x_col])
            working_df["period_formatted"] = working_df[x_col].dt.strftime("%Y-%m")
            grouped = working_df.groupby("period_formatted")[y_col].agg(agg_func).reset_index()
            grouped.columns = ["name", "value"]
            grouped = grouped.sort_values("name")
        else:
            # Group by Categorical Dimension
            if x_col in working_df.columns:
                grouped = working_df.groupby(x_col)[y_col].agg(agg_func).reset_index()
                grouped.columns = ["name", "value"]
                grouped = grouped.sort_values(by="value", ascending=False).head(12)
            else:
                val = working_df[y_col].agg(agg_func) if y_col in working_df.columns else 0.0
                grouped = pd.DataFrame({"name": [f"Dataset {agg_label}"], "value": [val]})

        data_points = []
        for _, row in grouped.iterrows():
            data_points.append({
                "name": str(row["name"]),
                "value": round(float(row["value"]), 2)
            })

        # Calculate metrics & takeaways
        total_val = float(grouped["value"].sum()) if not grouped.empty else 0.0
        avg_val = float(grouped["value"].mean()) if not grouped.empty else 0.0
        top_item = str(grouped.iloc[0]["name"]) if not grouped.empty else "N/A"
        top_val = float(grouped.iloc[0]["value"]) if not grouped.empty else 0.0
        top_share = round((top_val / total_val * 100), 1) if total_val > 0 else 0.0

        clean_y = y_col.replace('_', ' ').title()
        clean_x = x_col.replace('_', ' ').title()

        insights = [
            f"**{top_item}** is the leading segment with **{top_val:,.2f}** ({top_share}% of {agg_label.lower()} {clean_y.lower()}).",
            f"Cumulative plotted {clean_y.lower()} across top {len(grouped)} segments totals **{total_val:,.2f}**.",
            f"Segment mean ({agg_label.lower()}) is **{avg_val:,.2f}**."
        ]

        title = f"{agg_label} {clean_y} by {clean_x}"
        desc = f"Interactive {chart_type.upper()} visualization dynamically generated based on your statement: \"{query}\"."

        return DynamicChartResponse(
            title=title,
            description=desc,
            chart_type=chart_type,
            x_key="name",
            y_key="value",
            data=data_points,
            metrics={
                "total": round(total_val, 2),
                "average": round(avg_val, 2),
                "top_label": top_item,
                "top_value": round(top_val, 2),
                "top_share_pct": top_share
            },
            insights=insights,
            query_echo=query
        )

    @staticmethod
    def profile_dataset(df: pd.DataFrame, filename: str = "dataset.csv") -> DatasetProfileResponse:
        """Profiles dataset quality, types, missing values and distributions."""
        columns_info: List[ColumnInfo] = []
        total_cells = len(df) * len(df.columns) if not df.empty else 1
        total_missing = int(df.isnull().sum().sum())
        completeness_pct = max(0.0, round(((total_cells - total_missing) / total_cells * 100), 2))
        quality_score = max(0.0, round(100.0 - (total_missing / total_cells * 100), 1))

        for col in df.columns:
            missing = int(df[col].isnull().sum())
            missing_pct = round((missing / len(df) * 100), 2) if len(df) > 0 else 0.0
            unique_count = int(df[col].nunique())
            
            # Extract sample values, JSON-safe
            sample_vals = df[col].dropna().head(3).tolist()
            sample_vals_cleaned = [str(v) if isinstance(v, (pd.Timestamp, np.generic)) else v for v in sample_vals]

            columns_info.append(ColumnInfo(
                name=str(col),
                dtype=str(df[col].dtype),
                missing_count=missing,
                missing_pct=missing_pct,
                unique_count=unique_count,
                sample_values=sample_vals_cleaned
            ))

        # Clean preview rows
        preview_df = df.head(10).copy()
        for col in preview_df.select_dtypes(include=["datetime64[ns]", "datetime64"]).columns:
            preview_df[col] = preview_df[col].dt.strftime("%Y-%m-%d")
        preview_rows = preview_df.fillna("").to_dict(orient="records")

        return DatasetProfileResponse(
            filename=filename,
            total_rows=len(df),
            total_columns=len(df.columns),
            total_cells=total_cells,
            total_missing_cells=total_missing,
            completeness_pct=completeness_pct,
            columns=columns_info,
            quality_score=quality_score,
            formula_documentation="Quality Score = max(0, round(100 - (total_missing_cells / total_cells * 100), 1))",
            preview_rows=preview_rows
        )


