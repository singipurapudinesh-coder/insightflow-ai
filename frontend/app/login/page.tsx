"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Shield,
  ShieldCheck,
  Zap,
  BarChart2,
  Sparkles,
  TrendingUp,
  Send,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    // Mock authentication and session persistence
    setTimeout(() => {
      try {
        localStorage.setItem(
          "insightflow_user",
          JSON.stringify({
            name: name || (email.split("@")[0] || "User"),
            email,
            signedInAt: new Date().toISOString()
          })
        );
      } catch {}

      router.push("/dashboard");
    }, 700);
  };

  const handleSocialAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      try {
        localStorage.setItem(
          "insightflow_user",
          JSON.stringify({
            name: `${provider} User`,
            email: `user@${provider.toLowerCase()}.com`,
            provider,
            signedInAt: new Date().toISOString()
          })
        );
      } catch {}
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Ambient glowing radial backgrounds */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 py-8 flex-1 flex flex-col justify-between z-10">
        
        {/* Top Header */}
        <header className="flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform border border-blue-500/30">
              <Image
                src="/app-icon.png"
                alt="InsightFlow AI Icon"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">
                  InsightFlow
                </span>
                <span className="text-blue-500 font-extrabold text-lg">AI</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 block -mt-0.5">
                BUSINESS INTELLIGENCE COPILOT
              </span>
            </div>
          </Link>

          {/* Right Slogan */}
          <div className="hidden sm:flex items-center gap-2.5 text-right">
            <div className="w-0.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
            <div className="text-xs leading-tight font-medium text-slate-300">
              <div>Turn Your Data Into</div>
              <div className="text-slate-400">Smarter Decisions</div>
            </div>
          </div>
        </header>

        {/* Central Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto py-6">
          
          {/* Left Hero & Visual Mockup (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12]">
                Ask. Analyze. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Grow.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed font-normal">
                Upload your data, explore powerful insights, create stunning dashboards and get AI-powered answers — all in one place.
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Interactive Dashboards
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Visualize your data in real-time
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">
                  AI Copilot Assistant
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Ask questions in plain English
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Predictive Analytics
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Forecast trends & find opportunities
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Secure & Reliable
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Your data, your control
                </p>
              </div>
            </div>

            {/* Glowing Laptop Dashboard & Copilot Chat Mockup */}
            <div className="relative pt-4">
              {/* Perspective Glowing Laptop Body */}
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A0F1D] border border-blue-500/30 p-4 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
                
                {/* Laptop Inner Screen */}
                <div className="rounded-xl bg-[#090D18] border border-slate-800 p-3 space-y-3">
                  {/* Mini Screen Header */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800/80">
                    <span className="font-mono text-blue-400">Executive Dashboard</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      <span>Live Sync</span>
                    </div>
                  </div>

                  {/* Screen Content: Metric Cards + Mini Charts */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                      <div className="text-sm font-bold text-white mt-0.5">$125,430</div>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        ↑ 12.5%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Total Orders</span>
                      <div className="text-sm font-bold text-white mt-0.5">8,742</div>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        ↑ 18.2%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Profit Margin</span>
                      <div className="text-sm font-bold text-white mt-0.5">24.8%</div>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        ↑ 6.4%
                      </span>
                    </div>
                  </div>

                  {/* Graphical waves in background */}
                  <div className="h-20 w-full rounded-lg bg-slate-900/50 border border-slate-800/60 p-2 relative overflow-hidden flex items-end justify-between gap-1">
                    <div className="w-full h-12 bg-gradient-to-t from-blue-500/20 to-transparent absolute bottom-0 left-0" />
                    {[35, 55, 42, 70, 60, 85, 92, 78, 95].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="w-full bg-blue-500/40 rounded-t-sm z-10"
                      />
                    ))}
                  </div>
                </div>

                {/* Floating "Ask InsightFlow AI" Chat Card (Positioned overlapping right side) */}
                <div className="sm:absolute sm:-right-4 sm:-bottom-4 mt-3 sm:mt-0 w-full sm:w-[320px] rounded-2xl bg-[#0C1222]/95 border border-blue-500/40 p-4 shadow-2xl backdrop-blur-xl space-y-3 z-20">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ask InsightFlow AI</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      Copilot
                    </span>
                  </div>

                  {/* Question Bubble */}
                  <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-[11px] text-blue-200">
                    What were the top performing products last month?
                  </div>

                  {/* AI Response Bubble */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <p className="text-slate-400 text-[10px]">
                      Based on your data, the top 3 performing products by revenue were:
                    </p>
                    <p className="font-medium text-white">
                      1. Electronics (34.2%)<br />
                      2. Home & Living (28.7%)<br />
                      3. Fashion (21.6%)
                    </p>
                  </div>

                  {/* Input Mockup */}
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                    <span>Ask anything...</span>
                    <Send className="w-3 h-3 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Bottom Glowing Floor Reflection */}
              <div className="w-3/4 h-6 mx-auto bg-blue-500/20 blur-xl rounded-full" />
            </div>

            {/* Bottom Slogan */}
            <div className="text-xs text-slate-500 font-medium tracking-wide">
              Better Data <span className="mx-2 text-slate-700">/</span> Smarter Insights <span className="mx-2 text-slate-700">/</span> Bigger Opportunities
            </div>
          </div>

          {/* Right Authentication Form Card (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[460px] rounded-3xl bg-[#0B101E]/90 border border-slate-800/80 p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative">
              
              {/* Card Title & Subtitle */}
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {mode === "signin" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === "signin"
                    ? "Sign in to your InsightFlow AI account"
                    : "Start your analytics journey in minutes"}
                </p>
              </div>

              {/* Sign In / Sign Up Segmented Pill Switch */}
              <div className="flex items-center p-1 rounded-xl bg-[#070B14] border border-slate-800/80 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === "signin"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-center font-medium">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name field (Only on Sign Up) */}
                {mode === "signup" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-medium text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B14] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B14] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070B14] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to your email!")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  <span>{loading ? "Authenticating..." : mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5 text-slate-500 text-xs">
                <div className="flex-1 h-px bg-slate-800" />
                <span>or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialAuth("Google")}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070B14] hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {/* Google SVG Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth("GitHub")}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070B14] hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {/* GitHub SVG Icon */}
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Bottom Toggle Text */}
              <div className="mt-6 text-center text-xs text-slate-400">
                {mode === "signin" ? (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Bottom 3 Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-slate-400 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Your Data Stays Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Built for the Future</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

