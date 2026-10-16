"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Settings, Key, Database, Shield, Check, Save } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & Copilot Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your API connection, Supabase configuration, and AI model parameters.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {/* API Keys Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                FastAPI & LLM Credentials
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Backend API URL
                </label>
                <input
                  type="text"
                  defaultValue="http://localhost:8000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  LLM Model Selection
                </label>
                <select
                  defaultValue="gemini-2.5-flash"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saved ? "Saved Settings" : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

