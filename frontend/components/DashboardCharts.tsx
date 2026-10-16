"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { TimeSeriesPoint, CategoryBreakdown, RegionalBreakdown } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface DashboardChartsProps {
  timeSeries: TimeSeriesPoint[];
  categoryBreakdown: CategoryBreakdown[];
  regionalBreakdown: RegionalBreakdown[];
  metricName?: string;
  secondaryMetricName?: string;
  categoryDimName?: string;
  regionalDimName?: string;
}

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#3B82F6"];

export function DashboardCharts({
  timeSeries,
  categoryBreakdown,
  regionalBreakdown,
  metricName = "Revenue",
  secondaryMetricName = "Profit",
  categoryDimName = "Category",
  regionalDimName = "Territory",
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Time Series Area Chart */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              {metricName} & {secondaryMetricName} Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical timeline computed directly from uploaded records
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
            Real Analytics
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748B" opacity={0.2} />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg text-xs backdrop-blur-sm dark:bg-slate-900 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1.5">{label}</p>
                        <p className="text-indigo-600 dark:text-indigo-400 flex items-center justify-between gap-4">
                          <span>Revenue:</span>
                          <span className="font-semibold">{formatCurrency(payload[0]?.value as number)}</span>
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-4 mt-0.5">
                          <span>Profit:</span>
                          <span className="font-semibold">{formatCurrency(payload[1]?.value as number)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Area
                type="monotone"
                dataKey="sales"
                name="Revenue"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#profitGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Performance Bar Chart */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              {metricName} by {regionalDimName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Volume and margin distribution across {regionalDimName.toLowerCase()} segments
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748B" opacity={0.2} />
              <XAxis dataKey="region" tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg text-xs backdrop-blur-sm dark:bg-slate-900 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">{label} ({regionalDimName})</p>
                        <p className="text-indigo-600 dark:text-indigo-400">
                          {metricName}: <span className="font-semibold">{formatCurrency(payload[0]?.value as number)}</span>
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400">
                          {secondaryMetricName}: <span className="font-semibold">{formatCurrency(payload[1]?.value as number)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar dataKey="sales" name={metricName} fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name={secondaryMetricName} fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              {categoryDimName} Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated metrics, profitability share, and volume across {categoryDimName.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">{categoryDimName}</th>
                <th className="py-2.5 px-3">{metricName} Volume</th>
                <th className="py-2.5 px-3">{secondaryMetricName}</th>
                <th className="py-2.5 px-3">Margin %</th>
                <th className="py-2.5 px-3">Orders</th>
                <th className="py-2.5 px-3">Profitability Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {categoryBreakdown.map((cat, idx) => (
                <tr key={cat.category} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {cat.category}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(cat.sales)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(cat.profit)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">
                      {cat.margin_pct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {cat.orders}
                  </td>
                  <td className="py-3 px-3 w-48">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(10, cat.margin_pct * 3))}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

