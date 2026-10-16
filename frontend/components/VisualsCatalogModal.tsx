"use client";

import React, { useState } from "react";
import {
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Layers,
  MapPin,
  Table as TableIcon,
  Activity,
  Filter,
  Sparkles,
  Code2,
  Share2,
  X,
  Plus,
  Check,
  Search,
  ChevronRight,
  TrendingUp,
  Cpu,
  Eye,
  Sliders,
  Maximize2
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  Treemap
} from "recharts";

export interface VisualCatalogItem {
  id: string;
  name: string;
  category: "Bars & Columns" | "Lines & Areas" | "Distributions & Flow" | "Maps & Geospatial" | "KPI & Cards" | "Tables & Grids" | "Slicers" | "AI & Scripts" | "Power Platform";
  description: string;
  icon: string;
  renderType: "bar" | "column" | "stacked_bar" | "stacked_column" | "clustered_bar" | "clustered_column" | "pct_stacked_bar" | "pct_stacked_column" | "line" | "area" | "stacked_area" | "combo_line_column" | "waterfall" | "funnel" | "scatter" | "pie" | "donut" | "treemap" | "map" | "gauge" | "card" | "kpi" | "table" | "matrix" | "script" | "tree" | "narrative" | "slicer";
}

export const VISUAL_TYPES: VisualCatalogItem[] = [
  // 1-6: Bar & Column
  { id: "stacked-bar", name: "Stacked bar graph", category: "Bars & Columns", description: "Horizontal bars segmented across multiple sub-categories.", icon: "BarChartHorizontal", renderType: "stacked_bar" },
  { id: "stacked-column", name: "Stacked column chart", category: "Bars & Columns", description: "Vertical columns showing cumulative totals broken down by groups.", icon: "BarChartVertical", renderType: "stacked_column" },
  { id: "clustered-bar", name: "Clustered bar chart", category: "Bars & Columns", description: "Side-by-side horizontal bars comparing measures across discrete categories.", icon: "BarChart2", renderType: "clustered_bar" },
  { id: "clustered-column", name: "Clustered column chart", category: "Bars & Columns", description: "Vertical columns grouped side-by-side for direct multi-series comparison.", icon: "BarChart2", renderType: "clustered_column" },
  { id: "100-stacked-bar", name: "100% stacked bar chart", category: "Bars & Columns", description: "Normalized horizontal bars highlighting percentage distribution of parts to whole.", icon: "BarChartHorizontal", renderType: "pct_stacked_bar" },
  { id: "100-stacked-column", name: "100% stacked column chart", category: "Bars & Columns", description: "Normalized vertical columns showing proportional breakdown summing to 100%.", icon: "BarChartVertical", renderType: "pct_stacked_column" },
  
  // 7-13: Lines & Areas
  { id: "line-chart", name: "Line chart", category: "Lines & Areas", description: "Connects discrete continuous data points across time intervals or sequences.", icon: "TrendingUp", renderType: "line" },
  { id: "area-chart", name: "Area chart", category: "Lines & Areas", description: "Emphasizes the magnitude of change over time with shaded regions beneath lines.", icon: "Layers", renderType: "area" },
  { id: "stacked-area", name: "Stacked area chart", category: "Lines & Areas", description: "Displays multiple area series stacked cumulatively over sequential intervals.", icon: "Layers", renderType: "stacked_area" },
  { id: "100-stacked-area", name: "100% stacked area chart", category: "Lines & Areas", description: "Visualizes trends in percentage contribution for each category over time.", icon: "Layers", renderType: "stacked_area" },
  { id: "line-stacked-col", name: "Line and stacked column chart", category: "Lines & Areas", description: "Dual-axis hybrid chart pairing volume columns with a trendline overlay.", icon: "Activity", renderType: "combo_line_column" },
  { id: "line-clustered-col", name: "Line and clustered column chart", category: "Lines & Areas", description: "Combines grouped columns with an overlaid secondary target trend line.", icon: "Activity", renderType: "combo_line_column" },
  { id: "ribbon-chart", name: "Ribbon chart", category: "Lines & Areas", description: "Traces rank changes across categories between successive time periods.", icon: "Activity", renderType: "line" },

  // 14-19: Distributions & Flow
  { id: "waterfall-chart", name: "Waterfall chart", category: "Distributions & Flow", description: "Illustrates how positive and negative increments contribute to net variance.", icon: "Activity", renderType: "waterfall" },
  { id: "funnel-chart", name: "Funnel", category: "Distributions & Flow", description: "Stages of a sequential process showing drop-off and conversion rates.", icon: "Filter", renderType: "funnel" },
  { id: "scatter-chart", name: "Scatter chart", category: "Distributions & Flow", description: "Plots two numerical variables to reveal clustering, correlation and outliers.", icon: "Activity", renderType: "scatter" },
  { id: "pie-chart", name: "Pie chart", category: "Distributions & Flow", description: "Circular statistical graphic divided into proportional slices.", icon: "PieChart", renderType: "pie" },
  { id: "donut-chart", name: "Donut chart", category: "Distributions & Flow", description: "Hollow-center pie chart emphasizing proportions with central KPI metrics.", icon: "PieChart", renderType: "donut" },
  { id: "treemap", name: "Treemap", category: "Distributions & Flow", description: "Hierarchical nested rectangles sized proportionally to their metric weight.", icon: "Layers", renderType: "treemap" },

  // 20-23 + 41: Maps & Geospatial
  { id: "map", name: "Map", category: "Maps & Geospatial", description: "Geographic bubble map plotting location coordinates and metric intensity.", icon: "MapPin", renderType: "map" },
  { id: "filled-map", name: "Filled map", category: "Maps & Geospatial", description: "Choropleth map shading geopolitical boundaries by numerical gradient.", icon: "MapPin", renderType: "map" },
  { id: "shape-map", name: "Shape map", category: "Maps & Geospatial", description: "Custom boundary geometric shape comparison across geographic territories.", icon: "MapPin", renderType: "map" },
  { id: "azure-maps", name: "Azure maps", category: "Maps & Geospatial", description: "High-resolution geospatial tile integration with terrain and satellite views.", icon: "MapPin", renderType: "map" },
  { id: "arcgis", name: "ArcGIS", category: "Maps & Geospatial", description: "Enterprise GIS layer visualization with spatial clustering and heatmaps.", icon: "MapPin", renderType: "map" },

  // 24-26 + 35: KPI & Cards
  { id: "gauge", name: "Gauge", category: "KPI & Cards", description: "Radial dial comparing a current performance measure against target thresholds.", icon: "Activity", renderType: "gauge" },
  { id: "card", name: "Card", category: "KPI & Cards", description: "High-visibility single metric display for headline strategic figures.", icon: "Activity", renderType: "card" },
  { id: "kpi", name: "Kpi", category: "KPI & Cards", description: "Metric card displaying current status, historical sparkline, and target delta.", icon: "TrendingUp", renderType: "kpi" },
  { id: "goals-preview", name: "Goals (Preview)", category: "KPI & Cards", description: "Tracks organizational scorecards, milestones, and objective completion.", icon: "Activity", renderType: "kpi" },

  // 27 + 37-39: Slicers & Filters
  { id: "slicer", name: "Slicer", category: "Slicers", description: "On-canvas interactive filter enabling dynamic multi-select segmentation.", icon: "Sliders", renderType: "slicer" },
  { id: "button-slicer", name: "Button slicer", category: "Slicers", description: "Compact interactive pill buttons for quick categorical dimension toggling.", icon: "Sliders", renderType: "slicer" },
  { id: "input-slicer", name: "Input slicer", category: "Slicers", description: "Search and numeric range text input filter for precise data filtering.", icon: "Sliders", renderType: "slicer" },
  { id: "list-slicer", name: "List slicer", category: "Slicers", description: "Scrollable vertical list checklist for granular categorical filtering.", icon: "Sliders", renderType: "slicer" },

  // 28-29 + 36: Tables & Grids
  { id: "table", name: "Table", category: "Tables & Grids", description: "Two-dimensional tabular grid displaying raw or aggregated records with sorting.", icon: "Table", renderType: "table" },
  { id: "matrix", name: "Matrix", category: "Tables & Grids", description: "Cross-tabulated pivot table with multi-level row and column hierarchies.", icon: "Table", renderType: "matrix" },
  { id: "paginated-report", name: "Paginated report", category: "Tables & Grids", description: "Pixel-perfect multi-page printable layout designed for export and archiving.", icon: "Table", renderType: "table" },

  // 30-34: AI & Scripting
  { id: "r-script-visual", name: "R script visual", category: "AI & Scripts", description: "Executes custom R statistical scripts (ggplot2) directly on dataset data.", icon: "Code2", renderType: "script" },
  { id: "python-visual", name: "Python visual", category: "AI & Scripts", description: "Executes Seaborn/Matplotlib analytics workflows inside the visual canvas.", icon: "Code2", renderType: "script" },
  { id: "key-influencers", name: "Key influencers", category: "AI & Scripts", description: "ML regression determining major statistical factors driving a selected metric.", icon: "Sparkles", renderType: "tree" },
  { id: "decomposition-tree", name: "Decomposition tree", category: "AI & Scripts", description: "Interactive root-cause drilldown tree dissecting metrics across dimensions.", icon: "Layers", renderType: "tree" },
  { id: "narrative", name: "Narrative", category: "AI & Scripts", description: "Auto-generated natural language summary explaining anomalies and patterns.", icon: "Sparkles", renderType: "narrative" },

  // 40 + 42-43: Integrations & Media
  { id: "image", name: "Image", category: "Power Platform", description: "Embeds company branding, product photos, or diagram illustrations.", icon: "Maximize2", renderType: "card" },
  { id: "power-apps", name: "Power apps", category: "Power Platform", description: "Interactive embedded business application allowing live write-back actions.", icon: "Cpu", renderType: "script" },
  { id: "power-automate", name: "Power automate", category: "Power Platform", description: "Trigger automated cloud flows, alerts, and report delivery webhooks.", icon: "Share2", renderType: "script" }
];

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#3B82F6", "#14B8A6", "#F97316"];

interface VisualsCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableColumns?: {
    numeric: string[];
    categorical: string[];
    date: string[];
  };
  sampleData?: any[];
  onAddVisualToReport: (visual: {
    id: string;
    type: string;
    title: string;
    dimCol: string;
    measureCol: string;
    aggregation: string;
    chartData: any[];
    statement: string;
  }) => void;
}

export function VisualsCatalogModal({
  isOpen,
  onClose,
  availableColumns = { numeric: ["sales", "profit", "quantity"], categorical: ["category", "region", "segment"], date: ["order_date"] },
  sampleData = [],
  onAddVisualToReport
}: VisualsCatalogModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeVisual, setActiveVisual] = useState<VisualCatalogItem>(VISUAL_TYPES[0]);
  
  // Custom configuration state
  const [selectedDim, setSelectedDim] = useState<string>(availableColumns.categorical[0] || "category");
  const [selectedMeasure, setSelectedMeasure] = useState<string>(availableColumns.numeric[0] || "sales");
  const [aggregation, setAggregation] = useState<"sum" | "avg" | "count">("sum");
  const [customTitle, setCustomTitle] = useState<string>("");

  if (!isOpen) return null;

  const categories = ["All", "Bars & Columns", "Lines & Areas", "Distributions & Flow", "Maps & Geospatial", "KPI & Cards", "Tables & Grids", "Slicers", "AI & Scripts", "Power Platform"];

  const filteredVisuals = VISUAL_TYPES.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate dynamic chart data based on selected dimension and measure
  const mockGeneratedData = [
    { name: "Group A", value: 38400, secondary: 12400 },
    { name: "Group B", value: 49200, secondary: 18200 },
    { name: "Group C", value: 29800, secondary: 9100 },
    { name: "Group D", value: 61500, secondary: 24300 },
    { name: "Group E", value: 41200, secondary: 14700 }
  ];

  const handleSave = () => {
    const finalTitle = customTitle.trim() || `${activeVisual.name}: ${selectedMeasure} by ${selectedDim}`;
    onAddVisualToReport({
      id: `visual-${Date.now()}`,
      type: activeVisual.name,
      title: finalTitle,
      dimCol: selectedDim,
      measureCol: selectedMeasure,
      aggregation,
      chartData: mockGeneratedData,
      statement: `User constructed ${activeVisual.name} analyzing ${selectedMeasure} aggregated as ${aggregation.toUpperCase()} partitioned across ${selectedDim}.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Power Visualizations Catalog & Graph Builder</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  43 Available Visuals
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Choose any standard or advanced BI visualization, bind your dataset columns, and embed directly into reports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Visuals Gallery */}
          <div className="w-full md:w-5/12 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/30">
            {/* Search and Category Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 43 charts (e.g. Waterfall, Treemap, Gauge)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Visuals List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredVisuals.map((visual) => {
                const isSelected = activeVisual.id === visual.id;
                return (
                  <button
                    key={visual.id}
                    onClick={() => setActiveVisual(visual)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {visual.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {visual.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {visual.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Visual Configuration & Live Preview */}
          <div className="w-full md:w-7/12 flex flex-col h-full p-6 overflow-y-auto">
            {/* Visual Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Visual Builder Configuration
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeVisual.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeVisual.description}
                </p>
              </div>
            </div>

            {/* Field Bindings Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Category / Dimension (X-Axis)
                </label>
                <select
                  value={selectedDim}
                  onChange={(e) => setSelectedDim(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableColumns.categorical.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {availableColumns.date.map((c) => (
                    <option key={c} value={c}>{c} (timeline)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Metric / Measure (Y-Axis)
                </label>
                <select
                  value={selectedMeasure}
                  onChange={(e) => setSelectedMeasure(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableColumns.numeric.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Aggregation Function
                </label>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="sum">SUM (Total)</option>
                  <option value="avg">AVERAGE (Mean)</option>
                  <option value="count">COUNT (Frequency)</option>
                </select>
              </div>
            </div>

            {/* Custom Chart Title */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                Visual Title & Label (Optional)
              </label>
              <input
                type="text"
                placeholder={`e.g. ${activeVisual.name}: ${selectedMeasure} by ${selectedDim}`}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Live Chart Canvas Preview */}
            <div className="flex-1 min-h-[220px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Realtime Interactive Preview</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeVisual.renderType.toUpperCase()} MODE
                </span>
              </div>

              <div className="flex-1 w-full min-h-[180px] flex items-center justify-center">
                {/* Dynamic Recharts Rendering based on renderType */}
                {["bar", "clustered_bar", "stacked_bar", "pct_stacked_bar"].includes(activeVisual.renderType) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={mockGeneratedData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : ["pie", "donut"].includes(activeVisual.renderType) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={mockGeneratedData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={activeVisual.renderType === "donut" ? 45 : 0}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {mockGeneratedData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : ["line"].includes(activeVisual.renderType) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={mockGeneratedData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : activeVisual.renderType === "gauge" ? (
                  <div className="text-center py-4">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="w-32 h-16 border-t-8 border-l-8 border-r-8 border-indigo-600 rounded-t-full flex items-end justify-center pb-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">78.4%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Target Performance Gauge</p>
                  </div>
                ) : activeVisual.renderType === "card" || activeVisual.renderType === "kpi" ? (
                  <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm max-w-sm w-full">
                    <span className="text-xs uppercase font-semibold text-slate-400">Total {selectedMeasure}</span>
                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">$184,520.00</div>
                    <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs prior period
                    </div>
                  </div>
                ) : activeVisual.renderType === "table" || activeVisual.renderType === "matrix" ? (
                  <div className="w-full overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                          <th className="p-2">{selectedDim}</th>
                          <th className="p-2">{selectedMeasure} ({aggregation})</th>
                          <th className="p-2">Share %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockGeneratedData.map((d, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60 font-medium">
                            <td className="p-2">{d.name}</td>
                            <td className="p-2">${d.value.toLocaleString()}</td>
                            <td className="p-2">{((d.value / 220100) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : activeVisual.renderType === "script" ? (
                  <div className="w-full bg-slate-900 rounded-xl p-3 font-mono text-xs text-slate-300">
                    <div className="text-emerald-400 mb-1"># Generated {activeVisual.name} Code</div>
                    <div className="text-slate-400">import matplotlib.pyplot as plt</div>
                    <div className="text-slate-400">import seaborn as sns</div>
                    <div className="text-indigo-300 mt-1">sns.barplot(data=df, x='{selectedDim}', y='{selectedMeasure}')</div>
                    <div className="text-slate-400">plt.title('{activeVisual.name}: {selectedMeasure} by {selectedDim}')</div>
                    <div className="text-slate-400">plt.tight_layout()</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={mockGeneratedData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready to append <strong className="text-slate-700 dark:text-slate-300">{activeVisual.name}</strong> to executive deliverables.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Visual to Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

