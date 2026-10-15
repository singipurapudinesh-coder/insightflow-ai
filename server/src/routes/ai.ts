import { Router, Request, Response } from "express";
import axios from "axios";
import { datasetStore } from "./datasets";
import { executeAggregation } from "../utils/dataProcessor";

const router = Router();

router.post("/ask", async (req: Request, res: Response) => {
  try {
    const { datasetId = "demo", question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing required parameter 'question'" });
    }

    const ds = datasetStore.get(datasetId) || datasetStore.get("demo");
    if (!ds) {
      return res.status(404).json({ error: "Dataset not found. Please upload a dataset first." });
    }

    const numCols = ds.profile.columns.filter((c) => c.type === "numeric").map((c) => c.name);
    const catCols = ds.profile.columns.filter((c) => c.type === "string").map((c) => c.name);

    // 1. Determine Metric & Dimension (via Gemini API or Smart Heuristic)
    let plan = {
      metric: numCols.find((c) => /profit/i.test(c)) || numCols[0],
      dimension: catCols.find((c) => /reg|zone|state/i.test(c)) || catCols[0],
      aggregation: "sum" as "sum" | "mean" | "count" | "min" | "max",
      chart: "bar3d",
      explanation: ""
    };

    const qLower = question.toLowerCase();

    // Check if Gemini API key exists for live LLM parsing
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const schemaSummary = {
          columns: ds.profile.columns.map((c) => ({ name: c.name, type: c.type, sample: c.sampleValues })),
          rowCount: ds.profile.rowCount
        };

        const prompt = `You are InsightFlow AI BI Copilot. Convert this question into a strict JSON query plan.
Question: "${question}"
Schema: ${JSON.stringify(schemaSummary)}

Respond ONLY with JSON matching:
{
  "metric": "chosen_numeric_column",
  "dimension": "chosen_categorical_column",
  "aggregation": "sum" | "mean" | "count" | "min" | "max",
  "chart": "bar3d" | "line" | "pie",
  "explanation": "1-sentence summary"
}`;

        const geminiResp = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
          },
          { timeout: 8000 }
        );

        const textOutput = geminiResp.data.candidates[0].content.parts[0].text;
        const parsedPlan = JSON.parse(textOutput);
        if (parsedPlan.metric && parsedPlan.dimension) {
          plan = {
            ...plan,
            ...parsedPlan,
            aggregation: parsedPlan.aggregation?.toLowerCase() || "sum"
          };
        }
      } catch (e: any) {
        // Fallback to offline heuristic
      }
    }

    // Offline NLP Heuristic fallback
    if (!plan.explanation) {
      if (/sales|revenue|turnover/i.test(qLower)) {
        plan.metric = numCols.find((c) => /sale|rev|amount/i.test(c)) || plan.metric;
      } else if (/profit|gain|margin/i.test(qLower)) {
        plan.metric = numCols.find((c) => /profit/i.test(c)) || plan.metric;
      } else if (/discount/i.test(qLower)) {
        plan.metric = numCols.find((c) => /discount/i.test(c)) || plan.metric;
      } else if (/quantity|units|volume/i.test(qLower)) {
        plan.metric = numCols.find((c) => /quant|qty/i.test(c)) || plan.metric;
      }

      if (/category|department/i.test(qLower)) {
        plan.dimension = catCols.find((c) => /cat|type/i.test(c)) || plan.dimension;
      } else if (/region|zone|state|area/i.test(qLower)) {
        plan.dimension = catCols.find((c) => /reg|state|zone/i.test(c)) || plan.dimension;
      } else if (/segment|customer/i.test(qLower)) {
        plan.dimension = catCols.find((c) => /seg|cust/i.test(c)) || plan.dimension;
      }

      if (/average|avg|mean/i.test(qLower)) plan.aggregation = "mean";
      else if (/count|how many/i.test(qLower)) plan.aggregation = "count";
      else plan.aggregation = "sum";

      plan.explanation = `Calculated ${plan.aggregation} of ${plan.metric} grouped by ${plan.dimension}.`;
    }

    // 2. Deterministically execute the aggregation in Node.js
    const chartData = executeAggregation(ds.rows, plan.dimension, plan.metric, plan.aggregation, 8);
    const topItem = chartData.length > 0 ? chartData[0] : null;

    const answer = topItem
      ? `The highest ${plan.metric} is in **${topItem.label}** with **$${topItem.value.toLocaleString()}** (${plan.aggregation}).`
      : plan.explanation;

    const sqlQuery = `SELECT ${plan.dimension}, ${plan.aggregation.toUpperCase()}(${plan.metric}) AS val FROM dataset GROUP BY ${plan.dimension} ORDER BY val DESC LIMIT 8;`;

    return res.json({
      question,
      answer,
      plan,
      chartData,
      sqlQuery,
      topItem
    });
  } catch (error: any) {
    return res.status(500).json({ error: "AI query failed: " + error.message });
  }
});

export default router;

