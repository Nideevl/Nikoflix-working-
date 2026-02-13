"use client";

import { useState } from "react";

export default function VerifyOtpForm({
  email,
  goBack,
  onVerified,
}: {
  email: string;
  goBack: () => void;
  onVerified: (email: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const floatLabel = (value: string) =>
    value ? "top-2 text-xs" : "top-4 text-base";

  async function verifyOtp() {
    if (!otp.trim()) {
      setError("Enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Invalid OTP");
      return;
    }

    onVerified(email);
  }

  const inputBase =
    "peer w-full h-14 px-5 pt-6 pb-2 rounded bg-[#0000006f] text-white border " +
    "focus:outline-none transition-all duration-200";

  return (
    <div className="w-full max-w-[420px]">

      {/* Title */}
      <h1 className="text-3xl font-black mb-2 tracking-wide">
        Verify your email
      </h1>

      <h2 className="mb-6 text-white/70 text-lg">
        Enter the OTP sent to <span className="text-white font-medium">{email}</span>
      </h2>

      <div className="space-y-6">

        {/* OTP INPUT */}
        <div className="relative">
          <input
            placeholder=" "
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            className={`${inputBase} ${
              error
                ? "border-red-600 focus:border-red-600"
                : "border-neutral-600 focus:border-white"
            }`}
          />

          <label
            className={`absolute left-5 text-neutral-400 transition-all duration-200 pointer-events-none
            ${floatLabel(otp)}
            peer-focus:top-2 peer-focus:text-xs`}
          >
            Enter OTP
          </label>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm -mt-2">
            <span className="text-lg leading-none">✕</span>
            {error}
          </div>
        )}

        {/* VERIFY BUTTON */}
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full h-12 bg-[#e50914] rounded font-semibold text-base hover:bg-[#f6121d] transition disabled:bg-[#e50914]/60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* CHANGE EMAIL */}
        <p
          onClick={goBack}
          className="text-gray-400 mt-8 cursor-pointer"
        >
          Wrong email?{" "}
          <span className="text-white font-medium hover:underline">
            Change it
          </span>
        </p>
      </div>
    </div>
  );
}
