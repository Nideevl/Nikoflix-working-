"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";

export default function SetPasswordForm({
  email,
  goBack,
  close,
}: {
  email: string;
  goBack: () => void;
  close: () => void;
}) {
  const router = useRouter();
  const { login } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // track blur interaction (important)
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const floatLabel = (value: string) =>
    value ? "top-2 text-xs" : "top-4 text-base";

  /* ---------------- Validation logic ---------------- */

  const passwordsMatch = password && confirm && password === confirm;
  const passwordValid = password.length >= 6;
  const canSubmit = passwordsMatch && passwordValid;

  useEffect(() => {
    if (!passwordTouched && !confirmTouched) return;

    if (passwordTouched && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (confirmTouched && password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
  }, [password, confirm, passwordTouched, confirmTouched]);

  /* ---------------- Submit handler ---------------- */

  async function setPasswordHandler() {
    // force validation if user clicks directly
    setPasswordTouched(true);
    setConfirmTouched(true);

    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/set-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to set password");
      return;
    }

    if (data.token) {
      login(data.token);
      localStorage.setItem("token", data.token);
    }

    router.push("/");
    close();
  }

  /* ---------------- Input style ---------------- */

  const inputBase =
    "peer w-full h-14 px-5 pt-6 pb-2 rounded bg-[#0000006f] text-white border " +
    "focus:outline-none transition-all duration-200";

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full max-w-[420px]">

      {/* Title */}
      <h1 className="text-3xl font-black mb-2 tracking-wide">
        Create a password
      </h1>

      <h2 className="mb-6 text-white/70 text-lg">
        Secure your account for{" "}
        <span className="text-white font-medium">{email}</span>
      </h2>

      <div className="space-y-6">

        {/* PASSWORD */}
        <div className="relative">
          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            className={`${inputBase} ${
              error
                ? "border-red-600 focus:border-red-600"
                : "border-neutral-600 focus:border-white"
            }`}
          />

          <label
            className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
            ${floatLabel(password)}
            peer-focus:top-2 peer-focus:text-xs`}
          >
            New password
          </label>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative">
          <input
            type="password"
            placeholder=" "
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setConfirmTouched(true)}
            className={`${inputBase} ${
              error
                ? "border-red-600 focus:border-red-600"
                : "border-neutral-600 focus:border-white"
            }`}
          />

          <label
            className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
            ${floatLabel(confirm)}
            peer-focus:top-2 peer-focus:text-xs`}
          >
            Confirm password
          </label>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm -mt-2">
            <span className="text-lg leading-none">✕</span>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={setPasswordHandler}
          disabled={!canSubmit || loading}
          className="w-full h-12 bg-[#e50914] rounded font-semibold text-base hover:bg-[#f6121d] transition disabled:bg-[#e50914]/60 disabled:cursor-not-allowed"
        >
          {loading ? "Setting password..." : "Create Account"}
        </button>

        {/* BACK */}
        <p
          onClick={goBack}
          className="text-gray-400 mt-8 cursor-pointer"
        >
          Need to verify again?{" "}
          <span className="text-white font-medium hover:underline">
            Go back
          </span>
        </p>
      </div>
    </div>
  );
}
