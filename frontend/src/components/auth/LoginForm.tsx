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

  async function handleLogin() {
    if (!identifier || !password) {
      setError("Enter username/email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
        }),
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
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black/80 w-[350px] sm:w-[450px] p-16 relative overflow-hidden">
      {/* Red moving shine animation on right and bottom borders */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 bottom-[-70px] w-[2px] h-full bg-gradient-to-b from-transparent via-[#a9060f]" />
        <div className="absolute bottom-0 right-[-70px] w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#9c070f]" />
      </div>

      <h2 className="text-white text-3xl font-bold mb-8 relative z-10">Sign In</h2>

      <div className="space-y-4 relative z-10">
        <input
          placeholder="Email or phone number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full h-12 px-4 bg-[#333] text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-white text-sm"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 bg-[#333] text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-white text-sm"
        />

        {error && (
          <p className="text-[#e87c03] text-sm mt-1">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 mt-6 bg-[#e50914] text-white font-semibold text-base hover:bg-[#f6121d] transition duration-150 disabled:bg-[#e50914]/50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="text-gray-400 text-sm flex items-center justify-between mt-3">
          <label className="flex items-center gap-1">
            <input type="checkbox" className="w-4 h-4 bg-gray-600" />
            <span>Remember me</span>
          </label>
          <a href="#" className="hover:underline">
            Need help?
          </a>
        </div>

        <p
          onClick={switchMode}
          className="text-gray-400 text-center mt-8 cursor-pointer hover:underline"
        >
          <span className="text-gray-500">New to Netflix?</span>{" "}
          <span className="text-white font-medium">Sign up now</span>
        </p>
      </div>
    </div>
  );
}