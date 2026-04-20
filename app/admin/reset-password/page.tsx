"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidSession(true);
      setChecking(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setValidSession(true);
        setChecking(false);
      }
    });
  }, []);

  const handleReset = async () => {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Something went wrong. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center space-y-3">
          <p className="text-red-500 text-sm">Invalid or expired reset link.</p>
          <a href="/admin" className="text-sm text-[#7c16ff] hover:underline">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm space-y-4">
        <div className="flex justify-center mb-2">
          <img src="https://thelifedao.io/logos/life-logo.svg" alt="LifeDAO" className="h-12" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 text-center">Set New Password</h1>

        {success ? (
          <div className="text-center space-y-2">
            <p className="text-emerald-600 text-sm">Password updated! Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleReset}
              disabled={loading || !password || !confirm}
              className="w-full py-3 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <a href="/admin" className="block text-center text-sm text-gray-400 hover:text-gray-600 transition">
              Back to login
            </a>
          </>
        )}
      </div>
    </div>
  );
}