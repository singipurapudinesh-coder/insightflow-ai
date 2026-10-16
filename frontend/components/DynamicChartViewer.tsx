"use client";

import React, { useState } from "react";
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
} from "recharts";
import { DynamicChartData } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import {
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  X
} from "lucide-react";

interface DynamicChartViewerProps {
  chartData: DynamicChartData;
  onClose?: () => void;
}

const COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899",
  "#3B82F6", "#14B8A6", "#F97316", "#06B6D4", "#84CC16"
];

export function DynamicChartViewer({ chartData, onClose }: DynamicChartViewerProps) {
  const [activeType, setActiveType] = useState<"bar" | "line" | "area" | "pie">(
    chartData.chart_type || "bar"
  );

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-6 shadow-md transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {chartData.title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {chartData.description}
          </p>
        </div>

        {/* Chart Type Selector & Close */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveType("bar")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeType === "bar"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
            <button
              onClick={() => setActiveType("line")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeType === "line"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setActiveType("area")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeType === "area"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
            <button
              onClick={() => setActiveType("pie")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeType === "pie"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Pie</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {chartData.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Cumulative Total
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatNumber(chartData.metrics.total || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Average / Segment
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatNumber(chartData.metrics.average || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Top Performer
            </span>
            <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block truncate">
              {chartData.metrics.top_label || "N/A"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Top Share
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {chartData.metrics.top_share_pct || 0}%
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-72 w-full my-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeType === "pie" ? (
            <PieChart>
              <Pie
                data={chartData.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
                label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {chartData.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Value"]} />
            </PieChart>
          ) : activeType === "line" ? (
            <LineChart data={chartData.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Value"]} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey="value"
                name={chartData.title}
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6366F1" }}
              />
            </LineChart>
          ) : activeType === "area" ? (
            <AreaChart data={chartData.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="dynamicAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Value"]} />
              <Area
                type="monotone"
                dataKey="value"
                name={chartData.title}
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#dynamicAreaGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Value"]} />
              <Bar dataKey="value" name={chartData.title} radius={[6, 6, 0, 0]}>
                {chartData.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insights / Takeaways */}
      {chartData.insights && chartData.insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
            Analytical Takeaways
          </span>
          <div className="space-y-1.5">
            {chartData.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: insight }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

