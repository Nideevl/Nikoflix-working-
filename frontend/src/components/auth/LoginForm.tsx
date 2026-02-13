"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";

type LoginFormProps = {
  switchMode: () => void;
  close: () => void;
};

export default function LoginForm({ switchMode, close }: LoginFormProps) {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const floatLabel = (value: string) =>
    value ? "top-2 text-xs" : "top-4 text-base";

  async function handleLogin() {
    if (!identifier || !password) {
      setError("Please enter a valid email or mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        login(data.token);
        close();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Netflix input styles ---------------- */

  const inputWrapper = "relative w-full";

  const baseInput =
    "peer w-full h-14 px-5 pt-6 pb-2 rounded bg-[#333] text-white " +
    "placeholder-transparent border focus:outline-none transition-all duration-200";

  const borderState = error
    ? "border-red-600 focus:border-red-600"
    : "border-transparent focus:border-white";

  const labelStyle =
    "absolute left-5 text-gray-400 transition-all duration-200 pointer-events-none " +
    "top-4 text-base " +
    "peer-focus:top-2 peer-focus:text-xs " +
    "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base";

  /* ------------------------------------------------------ */

  return (
    <div className="w-full max-w-[420px]">

      {/* Title */}
      <h1 className="text-3xl font-black mb-2 tracking-wide">
        Enter your info to sign in
      </h1>

      <h2 className="mb-6 text-white/70 text-lg">
        Or get started with a new account.
      </h2>

      <div className="space-y-6">

        {/* EMAIL / PHONE */}
        <div className={inputWrapper}>
          <input
            placeholder=" "
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`peer w-full h-14 px-5 pt-6 pb-2 rounded bg-[#0000006f] text-white
    border ${error ? "border-red-600" : "border-neutral-600"}
    focus:border-white focus:outline-none transition-all duration-200`}
          />

          <label
            className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
    ${floatLabel(identifier)}
    peer-focus:top-2 peer-focus:text-xs`}
          >
            Email or mobile number
          </label>
        </div>

        {/* PASSWORD */}
        <div className={inputWrapper}>
          <div className="relative w-full">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`peer w-full h-14 px-5 pt-6 pb-2 rounded bg-[#0000006f] text-white
    border ${error ? "border-red-600" : "border-neutral-600"}
    focus:border-white focus:outline-none transition-all duration-200`}
            />

            <label
              className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
    ${floatLabel(password)}
    peer-focus:top-2 peer-focus:text-xs`}
            >
              Password
            </label>
          </div>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm -mt-2">
            <span className="text-lg leading-none">✕</span>
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={!identifier || !password || loading}
          className="w-full h-12 bg-[#e50914] rounded font-semibold text-base hover:bg-[#f6121d] transition disabled:bg-[#e50914]/60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* REMEMBER + HELP */}
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 bg-gray-600" />
            Remember me
          </label>

          <a href="#" className="hover:underline">
            Need help?
          </a>
        </div>

        {/* SIGNUP */}
        <p
          onClick={switchMode}
          className="text-gray-400 mt-8 cursor-pointer"
        >
          New to Netflix?{" "}
          <span className="text-white font-medium hover:underline">
            Sign up now
          </span>
        </p>
      </div>
    </div>
  );
}
