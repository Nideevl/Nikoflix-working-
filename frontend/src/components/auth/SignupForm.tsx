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
  const [usernameStatus, setUsernameStatus] =
    useState<"idle" | "checking" | "available" | "taken">("idle");
  const [typingTimer, setTypingTimer] = useState<any>(null);

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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Signup failed");
      return;
    }

    onOtp(email, username);
  }

  return (
    <div>
      <h2>Sign up</h2>

      {/* Username Input + Random Button */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
        />
        <button onClick={handleGenerateUsername}>🎲</button>
      </div>

      {/* Status */}
      {usernameStatus === "checking" && (
        <p style={{ color: "#aaa" }}>Checking username...</p>
      )}
      {usernameStatus === "available" && (
        <p style={{ color: "green" }}>✅ Username available</p>
      )}
      {usernameStatus === "taken" && (
        <p style={{ color: "red" }}>❌ Username already taken</p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button disabled={!canSignup} onClick={handleSignup}>
        Send OTP
      </button>

      <p onClick={switchMode}>Already have an account? Login</p>
    </div>
  );
}
