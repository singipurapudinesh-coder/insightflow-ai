/**
 * Data Processor Utility for InsightFlow AI Server.
 * Profiles datasets, performs grouped aggregations, and computes executive KPIs.
 */

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  columns: Array<{
    name: string;
    type: "numeric" | "datetime" | "string";
    sampleValues: any[];
    missingCount: number;
  }>;
  kpis: Record<string, string | number>;
  sample3DData: Array<{ label: string; value: number }>;
}

export function profileDataset(rows: Record<string, any>[]): DatasetProfile {
  if (!rows || rows.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      kpis: {},
      sample3DData: []
    };
  }

  const keys = Object.keys(rows[0]);
  const columns: DatasetProfile["columns"] = [];

  for (const key of keys) {
    let numericHits = 0;
    let missingHits = 0;
    const samples: any[] = [];

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const val = rows[i][key];
      if (val === null || val === undefined || val === "") {
        missingHits++;
      } else {
        if (samples.length < 3 && !samples.includes(val)) {
          samples.push(val);
        }
        const cleaned = String(val).replace(/[\$,₹,€,%\s]/g, "");
        if (!isNaN(Number(cleaned)) && cleaned.trim() !== "") {
          numericHits++;
        }
      }
    }

    const isNumeric = numericHits / Math.min(rows.length, 50) >= 0.7;
    columns.push({
      name: key,
      type: isNumeric ? "numeric" : "string",
      sampleValues: samples,
      missingCount: missingHits
    });
  }

  // Calculate high-level KPIs
  const numCols = columns.filter((c) => c.type === "numeric").map((c) => c.name);
  const salesCol = numCols.find((c) => /sale|rev|amount/i.test(c)) || numCols[0];
  const profitCol = numCols.find((c) => /profit|margin/i.test(c));

  const kpis: Record<string, string | number> = {
    "Total Records": rows.length.toLocaleString()
  };

  if (salesCol) {
    const totalSales = rows.reduce((acc, r) => acc + (Number(String(r[salesCol]).replace(/[\$,\s]/g, "")) || 0), 0);
    kpis["Total Sales"] = `$${Math.round(totalSales).toLocaleString()}`;

    if (profitCol) {
      const totalProfit = rows.reduce((acc, r) => acc + (Number(String(r[profitCol]).replace(/[\$,\s]/g, "")) || 0), 0);
      kpis["Total Profit"] = `$${Math.round(totalProfit).toLocaleString()}`;
      kpis["Profit Margin"] = totalSales > 0 ? `${((totalProfit / totalSales) * 100).toFixed(1)}%` : "0%";
    }
  }

  // 3D Regional or Categorical Breakdown (for Three.js scene)
  const catCols = columns.filter((c) => c.type === "string").map((c) => c.name);
  const regionCol = catCols.find((c) => /reg|zone|state|cat|type/i.test(c)) || catCols[0];
  const metricCol = profitCol || salesCol;

  const sample3DData: Array<{ label: string; value: number }> = [];
  if (regionCol && metricCol) {
    const groups: Record<string, number> = {};
    for (const r of rows) {
      const lbl = String(r[regionCol] || "Other");
      const val = Number(String(r[metricCol]).replace(/[\$,\s]/g, "")) || 0;
      groups[lbl] = (groups[lbl] || 0) + val;
    }
    for (const [k, v] of Object.entries(groups).slice(0, 8)) {
      sample3DData.push({ label: k, value: Math.round(v) });
    }
  }

  return {
    rowCount: rows.length,
    columnCount: keys.length,
    columns,
    kpis,
    sample3DData
  };
}

export function executeAggregation(
  rows: Record<string, any>[],
  dimension: string,
  metric: string,
  aggregation: "sum" | "mean" | "count" | "min" | "max" = "sum",
  limit: number = 8
) {
  if (!rows || rows.length === 0) return [];

  const groups: Record<string, { sum: number; count: number; min: number; max: number }> = {};

  for (const r of rows) {
    const dimVal = String(r[dimension] ?? "Unassigned");
    const numVal = Number(String(r[metric]).replace(/[\$,\s]/g, "")) || 0;

    if (!groups[dimVal]) {
      groups[dimVal] = { sum: 0, count: 0, min: numVal, max: numVal };
    }
    groups[dimVal].sum += numVal;
    groups[dimVal].count += 1;
    groups[dimVal].min = Math.min(groups[dimVal].min, numVal);
    groups[dimVal].max = Math.max(groups[dimVal].max, numVal);
  }

  const result = Object.entries(groups).map(([label, stats]) => {
    let value = stats.sum;
    if (aggregation === "mean") value = stats.count > 0 ? stats.sum / stats.count : 0;
    else if (aggregation === "count") value = stats.count;
    else if (aggregation === "min") value = stats.min;
    else if (aggregation === "max") value = stats.max;

    return { label, value: Math.round(value * 100) / 100 };
  });

  result.sort((a, b) => b.value - a.value);
  return result.slice(0, limit);
}

