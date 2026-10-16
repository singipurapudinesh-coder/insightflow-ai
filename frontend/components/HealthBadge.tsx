"use client";

import React, { useEffect, useState } from "react";
import { checkBackendHealth, HealthCheckResponse } from "@/lib/api";
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export function HealthBadge() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Offline");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={fetchHealth}
        title="Click to re-ping FastAPI backend"
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
      >
        {loading ? (
          <>
            <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
            <span className="text-slate-600 dark:text-slate-400">Pinging API...</span>
          </>
        ) : health?.status === "healthy" ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">FastAPI Connected</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-400">API Disconnected</span>
          </>
        )}
      </button>
    </div>
  );
}

