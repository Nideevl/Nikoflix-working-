"use client";

import { useEffect, useState } from "react";
import generateUsername from "@/lib/usernameGenerator";

export default function SignupForm({
  switchMode,
  onOtp,
}: {
  switchMode: () => void;
  onOtp: (email: string, username: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [typingTimer, setTypingTimer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ check username availability
  async function checkUsername(name: string) {
    if (!name.trim()) return false;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/check-username?username=${name}`
    );
    const data = await res.json();
    return data.available;
  }

  // ✅ auto-generate username on first load
  useEffect(() => {
    async function initUsername() {
      setUsernameStatus("checking");

      let name = "";
      let available = false;

      while (!available) {
        name = generateUsername();
        available = await checkUsername(name);
      }

      setUsername(name);
      setUsernameStatus("available");
    }

    initUsername();
  }, []);

  // ✅ debounce when user types manually
  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUsername(value);
    setUsernameStatus("checking");
    setError("");

    if (typingTimer) clearTimeout(typingTimer);

    const timer = setTimeout(async () => {
      const available = await checkUsername(value);
      setUsernameStatus(available ? "available" : "taken");
    }, 3000);

    setTypingTimer(timer);
  }

  // ✅ randomize button
  async function handleGenerateUsername() {
    setUsernameStatus("checking");
    setError("");

    let name = "";
    let available = false;

    while (!available) {
      name = generateUsername();
      available = await checkUsername(name);
    }

    setUsername(name);
    setUsernameStatus("available");
  }

  const canSignup = usernameStatus === "available" && email.trim();

  async function handleSignup() {
    if (!canSignup) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      onOtp(email, username);
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

      <h2 className="text-white text-3xl font-bold mb-8 relative z-10">
        Sign Up
      </h2>

      <div className="space-y-4 relative z-10">
        {/* Username Input with Random Button */}
        <div className="flex gap-2">
          <input
            value={username}
            onChange={handleUsernameChange}
            placeholder="Username"
            className="flex-1 h-12 px-4 bg-[#333] text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-white text-sm"
          />
          <button
            onClick={handleGenerateUsername}
            className="w-12 h-12 bg-[#333] text-white text-xl hover:bg-[#404040] transition duration-150 flex items-center justify-center"
            title="Generate random username"
          >
            🎲
          </button>
        </div>

        {/* Username Status */}
        {usernameStatus === "checking" && (
          <p className="text-gray-400 text-sm mt-1">Checking username...</p>
        )}
        {usernameStatus === "available" && (
          <p className="text-green-500 text-sm mt-1">✅ Username available</p>
        )}
        {usernameStatus === "taken" && (
          <p className="text-[#e87c03] text-sm mt-1">
            ❌ Username already taken
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="w-full h-12 px-4 bg-[#333] text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-white text-sm"
        />

        {error && <p className="text-[#e87c03] text-sm mt-1">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={!canSignup || loading}
          className="w-full h-12 mt-6 bg-[#e50914] text-white font-semibold text-base hover:bg-[#f6121d] transition duration-150 disabled:bg-[#e50914]/50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <p
          onClick={switchMode}
          className="text-gray-400 text-center mt-8 cursor-pointer hover:underline"
        >
          <span className="text-gray-500">Already have an account?</span>{" "}
          <span className="text-white font-medium">Sign in now</span>
        </p>
      </div>
    </div>
  );
}