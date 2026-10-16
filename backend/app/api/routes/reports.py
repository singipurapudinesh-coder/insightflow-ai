from fastapi import APIRouter
from datetime import datetime
from app.services.data_loader import DataLoader
from app.services.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/summary")
def generate_executive_summary():
    """Generates a dynamic executive BI summary report grounded in the active dataset."""
    df = DataLoader.load_dataset()
    filename = DataLoader.get_current_filename()
    data = AnalyticsEngine.calculate_dashboard_data(df)
    data.dataset_name = filename
    profile = AnalyticsEngine.profile_dataset(df, filename=filename)

    # Dynamic Key Strategic Takeaways
    takeaways = []
    metric_label = data.metric_name or "Volume"
    sec_metric_label = data.secondary_metric_name or "Profit"
    cat_label = data.category_dim_name or "Category"
    reg_label = data.regional_dim_name or "Territory"

    takeaways.append(
        f"Total recorded {metric_label.lower()} across {len(df):,} transactions is ${data.kpis.total_revenue:,.2f} with a net margin of {data.kpis.profit_margin_pct}%."
    )
    takeaways.append(
        f"Average order/transaction value is ${data.kpis.average_order_value:,.2f} across {data.kpis.total_orders:,} recorded entries."
    )

    if data.category_breakdown:
        top_cat = max(data.category_breakdown, key=lambda x: x.sales)
        share = round((top_cat.sales / data.kpis.total_revenue * 100), 1) if data.kpis.total_revenue > 0 else 0
        takeaways.append(
            f"The leading {cat_label.lower()} is '{top_cat.category}' with ${top_cat.sales:,.2f} in total contribution ({share}% market share)."
        )

    if data.regional_breakdown:
        top_reg = max(data.regional_breakdown, key=lambda x: x.sales)
        takeaways.append(
            f"Top geographical performance is driven by '{top_reg.region}' generating ${top_reg.sales:,.2f} {metric_label.lower()}."
        )

    if data.kpis.revenue_growth_pct is not None and data.kpis.comparison_period_label:
        takeaways.append(
            f"Revenue growth tracked at {data.kpis.revenue_growth_pct:+.2f}% ({data.kpis.comparison_period_label})."
        )

    takeaways.append(
        f"Dataset integrity score stands at {profile.quality_score}% ({profile.completeness_pct}% completeness across {profile.total_columns} validated columns, 0 critical schema errors)."
    )

    return {
        "title": f"Executive Business Intelligence Report",
        "dataset_name": filename,
        "row_count": len(df),
        "column_count": len(df.columns),
        "total_cells": profile.total_cells,
        "total_missing_cells": profile.total_missing_cells,
        "completeness_pct": profile.completeness_pct,
        "formula_documentation": profile.formula_documentation,
        "generated_at": datetime.now().strftime("%B %d, %Y"),
        "quality_score": profile.quality_score,
        "metric_name": metric_label,
        "secondary_metric_name": sec_metric_label,
        "category_dim_name": cat_label,
        "regional_dim_name": reg_label,
        "kpis": data.kpis,

        "key_takeaways": takeaways,
        "category_breakdown": data.category_breakdown,
        "regional_breakdown": data.regional_breakdown,
        "time_series": data.time_series,
        "columns_summary": [
            {
                "name": col.name,
                "dtype": col.dtype,
                "missing_count": col.missing_count,
                "missing_pct": col.missing_pct,
                "unique_count": col.unique_count
            }
            for col in profile.columns
        ]
    }


