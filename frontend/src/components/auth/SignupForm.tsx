"use client";

import { useEffect, useState } from "react";
import generateUsername from "@/lib/usernameGenerator";
import { useRouter } from 'next/navigation'; // Note: 'next/navigation' not 'next/router'
  
  export default function SignupForm({
    switchMode,
    onOtp,
  }: {
    switchMode: () => void;
    onOtp: (email: string) => void; // ✅ Simplified - no username param needed
  }) {
  const router = useRouter(); // Next.js equivalent of useNavigate
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [typingTimer, setTypingTimer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const floatLabel = (value: string) =>
    value ? "top-2 text-xs" : "top-4 text-base";

  async function checkUsername(name: string) {
    if (!name.trim()) return false;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/check-username?username=${name}`
    );
    const data = await res.json();
    return data.available;
  }

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

      onOtp(email); // ✅ Just pass email
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "peer w-full h-14 px-5 pt-6 pb-2 rounded bg-[#0000006f] text-white border " +
    "focus:outline-none transition-all duration-200";

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-3xl font-black mb-2 tracking-wide">
        Create your account
      </h1>

      <h2 className="mb-6 text-white/70 text-lg">
        Start your journey with NikoFlix.
      </h2>

      <div className="space-y-6">
        {/* USERNAME */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              placeholder=" "
              value={username}
              onChange={handleUsernameChange}
              className={`${inputBase} ${
                usernameStatus === "taken"
                  ? "border-red-600 focus:border-red-600"
                  : "border-neutral-600 focus:border-white"
              }`}
            />
            <label
              className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
              ${floatLabel(username)}
              peer-focus:top-2 peer-focus:text-xs`}
            >
              Username
            </label>
          </div>

          <button
            onClick={handleGenerateUsername}
            className="w-14 h-14 rounded bg-[#0000006f] border border-neutral-600 hover:border-white transition flex items-center justify-center"
          >
            🎲
          </button>
        </div>

        {/* USERNAME STATUS */}
        {usernameStatus === "checking" && (
          <p className="text-neutral-400 text-sm -mt-2">Checking username...</p>
        )}
        {usernameStatus === "available" && (
          <p className="text-green-500 text-sm -mt-2">Username available</p>
        )}
        {usernameStatus === "taken" && (
          <p className="text-red-600 text-sm -mt-2">Username already taken</p>
        )}

        {/* EMAIL */}
        <div className="relative">
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={`${inputBase} ${
              error ? "border-red-600 focus:border-red-600" : "border-neutral-600 focus:border-white"
            }`}
          />
          <label
            className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
            ${floatLabel(email)}
            peer-focus:top-2 peer-focus:text-xs`}
          >
            Email
          </label>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm -mt-2">
            <span className="text-lg leading-none">✕</span>
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSignup}
          disabled={!canSignup || loading}
          className="w-full h-12 bg-[#e50914] rounded font-semibold text-base hover:bg-[#f6121d] transition disabled:bg-[#e50914]/60"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {/* SWITCH */}
        <p
          onClick={switchMode}
          className="text-gray-400 mt-8 cursor-pointer"
        >
          Already have an account?{" "}
          <span className="text-white font-medium hover:underline"  onClick={() => router.push('/auth?step=login')}>
            Sign in now
          </span>
        </p>
      </div>
    </div>
  );
}