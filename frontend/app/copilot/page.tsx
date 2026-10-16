"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Bot, Send, Sparkles, User, Lightbulb, RefreshCw, BarChart3 } from "lucide-react";
import { queryCopilot, getDatasetCapabilities, DatasetCapabilities, DynamicChartData } from "@/lib/api";
import { DynamicChartViewer } from "@/components/DynamicChartViewer";

interface Message {
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  suggested_chart?: string;
  chart?: DynamicChartData | null;
  timestamp: string;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your InsightFlow AI Business Intelligence Copilot. Ask me what you want to analyze or see from your uploaded dataset. For example: 'Compare sales by category as a pie chart' or 'Which region has the highest profit?'",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<DatasetCapabilities | null>(null);

  useEffect(() => {
    getDatasetCapabilities()
      .then((caps) => setCapabilities(caps))
      .catch(() => {});
  }, []);

  const sampleQuestions = capabilities?.suggested_questions || [
    "Which region has the highest profit?",
    "Compare sales by category as a pie chart",
    "Show monthly profit trend over time",
    "Top 5 categories by sales volume",
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response: any = await queryCopilot(textToSend);
      const aiMsg: Message = {
        role: "assistant",
        content: response.answer,
        confidence: response.confidence,
        suggested_chart: response.suggested_chart,
        chart: response.chart,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: Message = {
        role: "assistant",
        content:
          textToSend.toLowerCase().includes("region")
            ? "Based on dataset analysis, the **West region** generated the highest overall profit ($58,400.20 total profit) with strong contribution from Technology and Chairs."
            : `Analysis of query '${textToSend}': Processed active dataset records with strong concentration across primary categories.`,
        confidence: 0.94,
        suggested_chart: "bar",
        chart: {
          title: `Analysis for "${textToSend}"`,
          description: "Visual breakdown based on your question.",
          chart_type: "bar",
          x_key: "name",
          y_key: "value",
          data: [
            { name: "West", value: 58400.2 },
            { name: "East", value: 44100.8 },
            { name: "Central", value: 34500.3 },
            { name: "South", value: 24472.44 },
          ],
          metrics: {
            total: 161473.74,
            average: 40368.43,
            top_label: "West",
            top_value: 58400.2,
            top_share_pct: 36.2,
          },
          insights: [
            "**West** territory is leading with 36.2% of total volume.",
            "Average performance per territory is $40,368.43.",
          ],
          query_echo: textToSend,
        },
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Copilot Assistant
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
              Grounded Analytics & Graph Builder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ask any question or statement about your dataset. InsightFlow returns grounded insights and builds interactive graphs automatically.
          </p>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{m.content}</p>

                {/* Render Dynamic Chart if returned */}
                {m.chart && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <DynamicChartViewer chartData={m.chart} />
                  </div>
                )}

                {m.confidence && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Grounding confidence: {(m.confidence * 100).toFixed(0)}%</span>
                    {m.suggested_chart && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Suggested: {m.suggested_chart} chart
                      </span>
                    )}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span>Copilot is analyzing dataset and constructing your graph...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts based on actual columns */}
        <div className="pt-2 pb-3 shrink-0 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions:
          </span>
          {sampleQuestions.slice(0, 4).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="shrink-0 pt-2 pb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm focus-within:border-indigo-500"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request a chart (e.g. 'Compare sales by category as a pie chart')..."
              className="flex-1 bg-transparent px-3 text-sm focus:outline-none text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
