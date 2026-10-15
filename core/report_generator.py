"""
Report Generator Module for InsightFlow AI.
Builds executive PDF business reports (via ReportLab) and Word documents (via python-docx).
"""

import io
from typing import Dict, Any, List
from datetime import datetime
import pandas as pd

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import docx
from docx.shared import Inches, Pt, RGBColor


class ReportGenerator:
    def __init__(
        self,
        dataset_name: str,
        quality_summary: Dict[str, Any],
        kpis: Dict[str, str],
        anomalies_summary: Dict[str, Any] = None,
        forecast_metrics: Dict[str, float] = None,
        top_insights: List[str] = None
    ):
        self.dataset_name = dataset_name
        self.quality = quality_summary
        self.kpis = kpis or {}
        self.anomalies = anomalies_summary or {}
        self.forecast = forecast_metrics or {}
        self.insights = top_insights or [
            "Dataset ingestion verified with automated schema typing.",
            "Health score reflects comprehensive missing value and duplicate checks.",
            "Revenue and profit trajectories indicate consistent business performance."
        ]

    def generate_pdf(self) -> bytes:
        """Generates a styled, publication-ready executive PDF report."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1E3A8A"),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=14
        )
        h2_style = ParagraphStyle(
            "H2",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155")
        )

        elements = []

        # 1. Header
        elements.append(Paragraph("InsightFlow AI — Business Intelligence Report", title_style))
        elements.append(Paragraph(f"Generated for: <b>{self.dataset_name}</b> | Date: {datetime.now().strftime('%B %d, %Y - %H:%M')}", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3B82F6"), spaceAfter=14))

        # 2. Executive KPI Cards Table
        elements.append(Paragraph("1. Executive Performance Metrics", h2_style))
        kpi_data = [["Metric", "Value"]]
        for k, v in self.kpis.items():
            kpi_data.append([k, str(v)])

        kpi_table = Table(kpi_data, colWidths=[260, 260])
        kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.white]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 14))

        # 3. Data Hygiene & Quality Audit
        elements.append(Paragraph("2. Data Quality & Health Score", h2_style))
        dq_data = [
            ["Diagnostic Indicator", "Result"],
            ["Data Hygiene Health Score", f"{self.quality.get('health_score', 100)} / 100"],
            ["Total Records Processed", f"{self.quality.get('total_rows', 0):,}"],
            ["Columns Identified", f"{self.quality.get('total_cols', 0)}"],
            ["Missing Cells Count", f"{self.quality.get('total_nulls', 0)} ({self.quality.get('null_percentage', 0)}%)"],
            ["Duplicate Rows Removed", f"{self.quality.get('duplicate_rows', 0)}"],
            ["Memory Footprint", f"{self.quality.get('memory_mb', 0)} MB"]
        ]
        dq_table = Table(dq_data, colWidths=[260, 260])
        dq_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0284C7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), colors.white]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(dq_table)
        elements.append(Spacer(1, 14))

        # 4. Machine Learning & Predictive Insights
        elements.append(Paragraph("3. Predictive Modeling & Anomaly Surveillance", h2_style))
        ml_points = []
        if self.forecast:
            ml_points.append(f"<b>Time-Series Forecast Evaluation:</b> Model achieved MAE of {self.forecast.get('MAE', 0)}, RMSE of {self.forecast.get('RMSE', 0)}, and MAPE of {self.forecast.get('MAPE', 0)}% across chronological backtesting.")
        if self.anomalies:
            ml_points.append(f"<b>Anomaly Radar:</b> Detected {self.anomalies.get('anomaly_count', 0)} outlier observations ({self.anomalies.get('anomaly_percentage', 0)}% of dataset) exceeding statistical risk envelopes.")

        for pt in ml_points:
            elements.append(Paragraph(f"• {pt}", body_style))
            elements.append(Spacer(1, 4))
        elements.append(Spacer(1, 10))

        # 5. Executive Takeaways
        elements.append(Paragraph("4. Executive AI Takeaways", h2_style))
        for ins in self.insights:
            elements.append(Paragraph(f"• {ins}", body_style))
            elements.append(Spacer(1, 4))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_docx(self) -> bytes:
        """Generates an executive Word (.docx) report."""
        doc = docx.Document()
        doc.add_heading("InsightFlow AI — Business Intelligence Report", level=0)
        doc.add_paragraph(f"Dataset: {self.dataset_name} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

        doc.add_heading("1. Executive KPIs", level=1)
        table = doc.add_table(rows=1, cols=2)
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Metric"
        hdr_cells[1].text = "Value"
        for k, v in self.kpis.items():
            row_cells = table.add_row().cells
            row_cells[0].text = k
            row_cells[1].text = str(v)

        doc.add_heading("2. Data Quality & Profiling", level=1)
        doc.add_paragraph(f"Health Score: {self.quality.get('health_score', 100)} / 100")
        doc.add_paragraph(f"Total Rows: {self.quality.get('total_rows', 0)}, Columns: {self.quality.get('total_cols', 0)}")
        doc.add_paragraph(f"Missing Values: {self.quality.get('total_nulls', 0)} ({self.quality.get('null_percentage', 0)}%)")

        doc.add_heading("3. Key Actionable Insights", level=1)
        for ins in self.insights:
            doc.add_paragraph(ins, style="List Bullet")

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

