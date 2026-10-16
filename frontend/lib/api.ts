export interface HealthCheckResponse {
  status: string;
  app_name: string;
  environment: string;
  version: string;
  timestamp: string;
  sample_data_ready: boolean;
  details: Record<string, any>;
}

export interface KPISummary {
  total_revenue: number;
  total_profit: number;
  profit_margin_pct: number;
  total_orders: number;
  average_order_value: number;
  total_quantity: number;
  revenue_growth_pct?: number | null;
  profit_growth_pct?: number | null;
  comparison_period_label?: string | null;
  baseline_description?: string | null;
}

export interface TimeSeriesPoint {
  date: string;
  sales: number;
  profit: number;
  orders: number;
}

export interface CategoryBreakdown {
  category: string;
  sales: number;
  profit: number;
  margin_pct: number;
  orders: number;
}

export interface RegionalBreakdown {
  region: string;
  sales: number;
  profit: number;
  orders: number;
}

export interface DashboardData {
  kpis: KPISummary;
  time_series: TimeSeriesPoint[];
  category_breakdown: CategoryBreakdown[];
  regional_breakdown: RegionalBreakdown[];
  dataset_name: string;
  total_rows: number;
  available_filters: {
    regions: string[];
    categories: string[];
  };
  metric_name?: string;
  secondary_metric_name?: string;
  category_dim_name?: string;
  regional_dim_name?: string;
}

export interface CopilotResponse {
  answer: string;
  confidence: number;
  suggested_chart?: string;
  dimensions?: string[];
  model_used: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Health check returned status: ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || "Unable to reach FastAPI backend");
  }
}

export async function getDashboardData(params?: {
  region?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}): Promise<DashboardData> {
  const query = new URLSearchParams();
  if (params?.region && params.region !== "All") query.append("region", params.region);
  if (params?.category && params.category !== "All") query.append("category", params.category);
  if (params?.start_date) query.append("start_date", params.start_date);
  if (params?.end_date) query.append("end_date", params.end_date);

  const url = `${API_BASE_URL}/api/analytics/dashboard?${query.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard data (${res.status})`);
  }
  return await res.json();
}

export async function queryCopilot(question: string): Promise<CopilotResponse> {
  const res = await fetch(`${API_BASE_URL}/api/copilot/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error(`Copilot query failed with status: ${res.status}`);
  }
  return await res.json();
}

export interface DatasetColumnInfo {
  name: string;
  dtype: string;
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  sample_values: any[];
}

export interface DatasetProfile {
  filename: string;
  total_rows: number;
  total_columns: number;
  total_cells?: number;
  total_missing_cells?: number;
  completeness_pct?: number;
  columns: DatasetColumnInfo[];
  quality_score: number;
  formula_documentation?: string;
  preview_rows: Record<string, any>[];
}

export interface UploadDatasetResponse {
  message: string;
  filename: string;
  row_count: number;
  column_count: number;
  profile: DatasetProfile;
}

export async function uploadDataset(file: File): Promise<UploadDatasetResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = `Upload failed with HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {}
    throw new Error(errorDetail);
  }

  return await res.json();
}

export async function getDatasetProfile(): Promise<DatasetProfile> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/profile`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load profile (${res.status})`);
  }
  return await res.json();
}

export async function getCurrentDatasetInfo(): Promise<{
  name: string;
  row_count: number;
  column_count: number;
  columns: string[];
  memory_usage_kb: number;
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/datasets/current`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface DynamicChartData {
  title: string;
  description: string;
  chart_type: "bar" | "line" | "pie" | "area";
  x_key: string;
  y_key: string;
  data: { name: string; value: number; [key: string]: any }[];
  metrics: {
    total?: number;
    average?: number;
    top_label?: string;
    top_value?: number;
    top_share_pct?: number;
  };
  insights: string[];
  query_echo: string;
}

export interface DatasetCapabilities {
  filename: string;
  row_count: number;
  column_count: number;
  numeric_columns: string[];
  categorical_columns: string[];
  date_columns: string[];
  suggested_questions: string[];
  overview_summary: string;
}

export async function getDatasetCapabilities(): Promise<DatasetCapabilities> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/capabilities`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load dataset capabilities (${res.status})`);
  }
  return await res.json();
}

export async function generateChartFromStatement(
  query: string,
  chartType: string = "auto"
): Promise<DynamicChartData> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/generate-chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, chart_type: chartType }),
  });
  if (!res.ok) {
    let errMessage = `Chart generation failed (${res.status})`;
    try {
      const err = await res.json();
      if (err.detail) errMessage = err.detail;
    } catch {}
    throw new Error(errMessage);
  }
  return await res.json();
}

export async function resetDataset(): Promise<{
  message: string;
  filename: string;
  row_count: number;
  column_count: number;
  profile: DatasetProfile;
}> {
  const res = await fetch(`${API_BASE_URL}/api/datasets/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to reset dataset (${res.status})`);
  }
  return await res.json();
}

export interface ExecutiveReportData {
  title: string;
  dataset_name: string;
  row_count: number;
  column_count: number;
  total_cells?: number;
  total_missing_cells?: number;
  completeness_pct?: number;
  formula_documentation?: string;
  generated_at: string;
  quality_score: number;
  metric_name: string;
  secondary_metric_name: string;
  category_dim_name: string;
  regional_dim_name: string;
  kpis: KPISummary;
  key_takeaways: string[];
  category_breakdown: CategoryBreakdown[];
  regional_breakdown: RegionalBreakdown[];
  time_series: TimeSeriesPoint[];
  columns_summary: {
    name: string;
    dtype: string;
    missing_count: number;
    missing_pct: number;
    unique_count: number;
  }[];
}

export async function getExecutiveReportSummary(): Promise<ExecutiveReportData> {
  const res = await fetch(`${API_BASE_URL}/api/reports/summary`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch executive report (${res.status})`);
  }
  return await res.json();
}




