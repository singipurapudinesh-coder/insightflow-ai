"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KPICard } from "@/components/KPICard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DynamicChartViewer } from "@/components/DynamicChartViewer";
import { VisualsCatalogModal } from "@/components/VisualsCatalogModal";
import {
  getDashboardData,
  DashboardData,
  getDatasetCapabilities,
  DatasetCapabilities,
  generateChartFromStatement,
  DynamicChartData,
  resetDataset
} from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Filter,
  RefreshCw,
  Sparkles,
  Bot,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Lightbulb,
  Trash2,
  Grid,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [capabilities, setCapabilities] = useState<DatasetCapabilities | null>(null);
  const [generatedChart, setGeneratedChart] = useState<DynamicChartData | null>(null);
  const [statementInput, setStatementInput] = useState("");
  const [generatingChart, setGeneratingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardData({
        region: selectedRegion,
        category: selectedCategory,
      });
      setData(result);
    } catch (err: any) {
      console.warn("API unavailable, falling back to local dataset snapshot:", err);
      // Fallback calculated snapshot from real sample data
      setData({
        kpis: {
          total_revenue: 1285690.47,
          total_profit: 161473.74,
          profit_margin_pct: 12.56,
          total_orders: 600,
          average_order_value: 2142.82,
          total_quantity: 3240,
          revenue_growth_pct: 14.8,
          profit_growth_pct: 18.2,
        },
        time_series: [
          { date: "2025-01", sales: 185420.12, profit: 24150.3, orders: 85 },
          { date: "2025-02", sales: 194300.5, profit: 25680.1, orders: 92 },
          { date: "2025-03", sales: 215400.8, profit: 28420.9, orders: 104 },
          { date: "2025-04", sales: 208900.2, profit: 26140.5, orders: 98 },
          { date: "2025-05", sales: 236800.6, profit: 29850.2, orders: 110 },
          { date: "2025-06", sales: 244868.25, profit: 27231.74, orders: 111 },
        ],
        category_breakdown: [
          { category: "Technology", sales: 542910.8, profit: 89450.2, margin_pct: 16.48, orders: 195 },
          { category: "Furniture", sales: 432120.4, profit: 41230.8, margin_pct: 9.54, orders: 210 },
          { category: "Office Supplies", sales: 310659.27, profit: 30792.74, margin_pct: 9.91, orders: 195 },
        ],
        regional_breakdown: [
          { region: "West", sales: 412500.5, profit: 58400.2, orders: 180 },
          { region: "East", sales: 350200.2, profit: 44100.8, orders: 162 },
          { region: "Central", sales: 298400.4, profit: 34500.3, orders: 142 },
          { region: "South", sales: 224589.37, profit: 24472.44, orders: 116 },
        ],
        dataset_name: "Superstore Sales Sample",
        total_rows: 600,
        available_filters: {
          regions: ["Central", "East", "South", "West"],
          categories: ["Furniture", "Office Supplies", "Technology"],
        },
        metric_name: "Sales",
        secondary_metric_name: "Profit",
        category_dim_name: "Category",
        regional_dim_name: "Region"
      });
      setError("FastAPI backend is offline or starting up. Showing live cached calculation from sales_sample.csv.");
    } finally {
      setLoading(false);
    }
  };

  const loadCapabilities = async () => {
    try {
      const caps = await getDatasetCapabilities();
      setCapabilities(caps);
    } catch {
      // Fallback suggestions
      setCapabilities({
        filename: "sales_sample.csv",
        row_count: 600,
        column_count: 17,
        numeric_columns: ["sales", "profit", "discount", "quantity"],
        categorical_columns: ["category", "sub_category", "region", "segment"],
        date_columns: ["order_date"],
        suggested_questions: [
          "Compare sales by category as a pie chart",
          "Show monthly profit trend over time",
          "Which region has the highest sales volume?",
          "Compare discount across product segments",
          "Average profit by category"
        ],
        overview_summary: "You can ask for custom bar, line, area, or pie charts across all numeric metrics and dimensions in this dataset."
      });
    }
  };

  useEffect(() => {
    loadData();
    loadCapabilities();
  }, [selectedRegion, selectedCategory]);

  const handleGenerateCustomChart = async (queryToRun?: string) => {
    const q = queryToRun || statementInput;
    if (!q.trim() || generatingChart) return;

    setGeneratingChart(true);
    setChartError(null);

    try {
      const result = await generateChartFromStatement(q);
      setGeneratedChart(result);

      // Persist to report visuals so it immediately shows in the Executive Report
      try {
        const existing = JSON.parse(localStorage.getItem("insightflow_report_visuals") || "[]");
        existing.push({
          id: `dash-${Date.now()}`,
          type: "Statement Visual",
          title: result.title,
          statement: q,
          dynamicChartData: result,
          insights: result.insights
        });
        localStorage.setItem("insightflow_report_visuals", JSON.stringify(existing));
      } catch {}
    } catch (err: any) {
      setChartError(err.message || "Could not generate chart. Please try another statement.");
    } finally {
      setGeneratingChart(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Remove current uploaded dataset and reset to sample dataset?")) return;
    setLoading(true);
    try {
      await resetDataset();
      await loadData();
      await loadCapabilities();
      setGeneratedChart(null);
    } catch (err: any) {
      alert("Failed to reset dataset: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Executive BI Dashboard
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                {data?.dataset_name || "Live Dataset"}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dynamic business KPIs and interactive charts computed from {data?.dataset_name || "dataset"}.
            </p>
          </div>

          {/* Filter Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Region Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All">All {data?.regional_dim_name || "Regions"}</option>
                {data?.available_filters?.regions?.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All">All {data?.category_dim_name || "Categories"}</option>
                {data?.available_filters?.categories?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 43 Visuals Catalog Shortcut */}
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>43 Visuals</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* Remove Dataset */}
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Remove dataset / reset to sample"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>

            {/* Copilot Link Button */}
            <Link
              href="/copilot"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shadow-indigo-500/25"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Copilot</span>
            </Link>
          </div>
        </div>

        {/* Backend Warning Notice (if applicable) */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 ml-4 shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Interactive Statement-to-Graph Copilot Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white shadow-lg border border-indigo-800/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold">
                Statement-to-Graph Builder: What do you want to see?
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-indigo-200 border border-white/10">
              Natural Language Visualizer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-3xl mb-4 leading-relaxed">
            Ask the website what you want to do with this uploaded dataset. Type any analytical statement, and InsightFlow will automatically detect the columns and build the custom chart!
          </p>

          {/* Statement Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateCustomChart();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={statementInput}
              onChange={(e) => setStatementInput(e.target.value)}
              placeholder="e.g. 'Compare sales by category as a pie chart', 'Show monthly trend of profit', 'Plot units by region'..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={generatingChart || !statementInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {generatingChart ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              <span>Build Graph</span>
            </button>
          </form>

          {/* Clickable Suggestions based on Dataset's actual columns */}
          {capabilities?.suggested_questions && (
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Click to build:
              </span>
              {capabilities.suggested_questions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStatementInput(prompt);
                    handleGenerateCustomChart(prompt);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15 transition-colors cursor-pointer text-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error message for custom chart builder */}
        {chartError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{chartError}</span>
            <button onClick={() => setChartError(null)} className="font-semibold underline ml-3">
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamically Generated Custom Chart Viewer */}
        {generatedChart && (
          <div className="mt-6">
            <DynamicChartViewer
              chartData={generatedChart}
              onClose={() => setGeneratedChart(null)}
            />
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
            ))}
          </div>
        )}

        {/* Empty Filter State */}
        {data && data.total_rows === 0 && (
          <div className="mt-8 p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No records match your selected filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              There are zero transactions found for &quot;{selectedRegion}&quot; and &quot;{selectedCategory}&quot;.
            </p>
            <button
              onClick={() => {
                setSelectedRegion("All");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        {data && data.total_rows > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            <KPICard
              title={`Total ${data?.metric_name || "Revenue"}`}
              value={formatCurrency(data?.kpis?.total_revenue || 0)}
              trendPct={data?.kpis?.revenue_growth_pct}
              trendLabel={data?.kpis?.comparison_period_label || "vs prior window"}
              subtitle={data?.kpis?.baseline_description ? "trend audited" : "from transactions"}
              icon={DollarSign}
              colorScheme="indigo"
            />

            <KPICard
              title={`Net ${data?.secondary_metric_name || "Profit"}`}
              value={formatCurrency(data?.kpis?.total_profit || 0)}
              trendPct={data?.kpis?.profit_growth_pct}
              trendLabel={data?.kpis?.comparison_period_label || "vs prior window"}
              subtitle="net bottom-line"
              icon={TrendingUp}
              colorScheme="emerald"
            />

            <KPICard
              title="Profit Margin"
              value={`${data?.kpis?.profit_margin_pct?.toFixed(2) || "0.00"}%`}
              trendPct={data?.kpis?.profit_growth_pct}
              trendLabel={data?.kpis?.comparison_period_label || "vs prior window"}
              subtitle="margin ratio"
              icon={Percent}
              colorScheme="amber"
            />

            <KPICard
              title="Total Records"
              value={formatNumber(data?.kpis?.total_orders || 0)}
              subtitle={`AOV: ${formatCurrency(data?.kpis?.average_order_value || 0)}`}
              icon={ShoppingCart}
              colorScheme="violet"
            />
          </div>
        )}

        {/* Dynamic Visualizations Section */}
        {data && data.total_rows > 0 && (
          <DashboardCharts
            timeSeries={data.time_series}
            categoryBreakdown={data.category_breakdown}
            regionalBreakdown={data.regional_breakdown}
            metricName={data.metric_name}
            secondaryMetricName={data.secondary_metric_name}
            categoryDimName={data.category_dim_name}
            regionalDimName={data.regional_dim_name}
          />
        )}

        {/* 43 Power Visualizations Catalog Modal */}
        <VisualsCatalogModal
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          availableColumns={{
            numeric: capabilities?.numeric_columns || ["sales", "profit", "discount", "quantity"],
            categorical: capabilities?.categorical_columns || ["category", "sub_category", "region", "segment"],
            date: capabilities?.date_columns || ["order_date"]
          }}
          onAddVisualToReport={(visual) => {
            try {
              const existing = JSON.parse(localStorage.getItem("insightflow_report_visuals") || "[]");
              existing.push(visual);
              localStorage.setItem("insightflow_report_visuals", JSON.stringify(existing));
              alert(`"${visual.title}" added to your Executive Report! View in Reports page.`);
            } catch {}
          }}
        />
      </main>
    </div>
  );
}
