import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const INK = "#12181F";
const PAPER = "#F6F1E7";
const JADE = "#3FA796";
const BRICK = "#A83C32";
const BRASS = "#C9A24B";
const SLATE = "#8B97A3";

function BackgroundArt() {
  const ticks = [180, 340, 500, 660, 820, 980, 1140, 1300, 1460];
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, background: "linear-gradient(160deg, #0A0F16 0%, #12181F 45%, #0E1A17 100%)" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(139,151,163,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,151,163,0.07) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      <div className="absolute rounded-full" style={{ width: 640, height: 640, top: -180, right: -160, background: "radial-gradient(circle, rgba(201,162,75,0.16), transparent 70%)", filter: "blur(6px)" }} />
      <div className="absolute rounded-full" style={{ width: 520, height: 520, bottom: -140, left: -140, background: "radial-gradient(circle, rgba(63,167,150,0.14), transparent 70%)", filter: "blur(6px)" }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="qfFlowAuth" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#3FA796" />
            <stop offset="100%" stopColor="#C9A24B" />
          </linearGradient>
        </defs>
        <path className="qf-flow-path" d="M -50 760 C 260 720, 480 560, 720 500 S 1120 300, 1650 120" fill="none" stroke="url(#qfFlowAuth)" strokeWidth="2" opacity="0.3" />
        {ticks.map((x, i) => {
          const y = 740 - i * 68;
          const up = i % 3 !== 1;
          return (
            <g key={x} opacity="0.22">
              <line x1={x} y1={y - 26} x2={x} y2={y + 26} stroke={up ? JADE : BRICK} strokeWidth="1.5" />
              <rect x={x - 5} y={up ? y - 12 : y - 4} width="10" height="16" fill={up ? JADE : BRICK} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TornEdge({ flip }) {
  return (
    <div
      style={{
        height: 10,
        backgroundImage: `linear-gradient(${flip ? 45 : 135}deg, ${PAPER} 25%, transparent 25%), linear-gradient(${flip ? -45 : -135 + 180}deg, ${PAPER} 25%, transparent 25%)`,
        backgroundSize: "14px 14px",
        backgroundPosition: flip ? "0 100%" : "0 0",
        backgroundColor: "transparent",
      }}
    />
  );
}

export default function AuthGate() {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      return "reset";
    }
    return "signin";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setInfo("Check your email for a password reset link.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setInfo("Password updated. You can now use it to sign in.");
        window.history.replaceState(null, "", window.location.pathname);
        setTimeout(() => setMode("signin"), 1500);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const statusText = {
    signin: "SECURE ACCESS — VERIFYING CREDENTIALS",
    signup: "NEW ACCOUNT — ENCRYPTED SIGNUP",
    forgot: "PASSWORD RECOVERY — SENDING RESET LINK",
    reset: "PASSWORD RECOVERY — SET NEW PASSWORD",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes qfDraw { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
        .qf-flow-path { stroke-dasharray: 2000; animation: qfDraw 2.4s ease-out forwards; }
        @keyframes qfFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .qf-card { animation: qfFadeUp 0.5s ease-out both; }
        @keyframes qfPulseRing { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
        .qf-pulse-ring { animation: qfPulseRing 1.6s cubic-bezier(0,0,0.2,1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .qf-flow-path { animation: none; stroke-dashoffset: 0; }
          .qf-card { animation: none; }
          .qf-pulse-ring { animation: none; }
        }
      `}</style>
      <BackgroundArt />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-serif text-4xl md:text-5xl" style={{ color: PAPER }}>QuantFlow</h1>
          <div className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: SLATE }}>
            Smart Budget &amp; Expense Analytics
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="qf-pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: JADE }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: JADE }} />
          </span>
          <span className="font-mono text-xs tracking-wider" style={{ color: SLATE }}>
            {statusText[mode]}
          </span>
        </div>

        <div className="qf-card rounded-2xl overflow-hidden" style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440" }}>
          <form onSubmit={handleSubmit} className="p-8">
            {mode !== "reset" && (
              <label className="block mb-4">
                <span className="block text-xs tracking-[0.15em] uppercase mb-2" style={{ color: SLATE }}>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none" style={{ background: "rgba(18,24,31,0.7)", border: "1px solid #2A3440", color: PAPER }} />
              </label>
            )}

            {(mode === "signin" || mode === "signup") && (
              <label className="block mb-2">
                <span className="block text-xs tracking-[0.15em] uppercase mb-2" style={{ color: SLATE }}>Password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none" style={{ background: "rgba(18,24,31,0.7)", border: "1px solid #2A3440", color: PAPER }} />
              </label>
            )}

            {mode === "reset" && (
              <label className="block mb-5">
                <span className="block text-xs tracking-[0.15em] uppercase mb-2" style={{ color: SLATE }}>New password</span>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none" style={{ background: "rgba(18,24,31,0.7)", border: "1px solid #2A3440", color: PAPER }} />
              </label>
            )}

            {mode === "signin" && (
              <div className="text-right mb-5">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); setInfo(null); }}
                  className="text-xs font-mono"
                  style={{ color: SLATE }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-lg px-4 py-3 mb-5 text-sm font-mono flex items-center gap-2" style={{ background: "rgba(168,60,50,0.12)", border: "1px solid rgba(168,60,50,0.35)", color: "#E39187" }}>
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-lg px-4 py-3 mb-5 text-sm font-mono flex items-center gap-2" style={{ background: "rgba(63,167,150,0.12)", border: "1px solid rgba(63,167,150,0.35)", color: JADE }}>
                ✦ {info}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-lg py-3 text-xs font-bold tracking-[0.1em] uppercase font-mono transition" style={{ background: loading ? "#2F7D6E" : JADE, color: INK, cursor: loading ? "default" : "pointer" }}>
              {loading
                ? "Please wait…"
                : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Sign Up"
                : mode === "forgot"
                ? "Send Reset Link"
                : "Update Password"}
            </button>
          </form>

          <div className="text-center py-4" style={{ borderTop: "1px solid #2A3440" }}>
            {mode === "forgot" || mode === "reset" ? (
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
                className="text-xs font-mono underline"
                style={{ color: SLATE }}
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
                className="text-xs font-mono underline"
                style={{ color: SLATE }}
              >
                {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}