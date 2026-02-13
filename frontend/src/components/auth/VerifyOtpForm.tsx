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
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otp = otpArray.join("");

  /* ---------------- OTP INPUT LOGIC ---------------- */

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otpArray];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtpArray(newOtp);
    setError("");

    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        const prev = e.currentTarget.previousSibling as HTMLInputElement;
        prev?.focus();
      }
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const newOtp = [...otpArray];

    for (let i = 0; i < pasted.length; i++) {
      if (index + i < newOtp.length) {
        newOtp[index + i] = pasted[i];
      }
    }

    setOtpArray(newOtp);

    const focusIndex = Math.min(index + pasted.length, 5);
    const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input");
    inputs[focusIndex]?.focus();
  };

  /* ---------------- VERIFY API ---------------- */

  async function verifyOtp() {
    if (!otp.trim() || otp.length < 6) {
      setError("Enter the 6-digit OTP sent to your email.");
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

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full max-w-[420px]">

      {/* Title */}
      <h1 className="text-3xl font-black mb-2 tracking-wide">
        Verify your email
      </h1>

      <h2 className="mb-6 text-white/70 text-lg">
        Enter the OTP sent to{" "}
        <span className="text-white font-medium">{email}</span>
      </h2>

      <div className="space-y-6">

        {/* OTP BOX GRID */}
        <div className="flex justify-between gap-2">
          {otpArray.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={(e) => handlePaste(e, index)}
              className={`otp-input w-14 h-16 text-center text-2xl font-black bg-[#0000006f] border rounded text-white focus:outline-none transition-all
  ${error
                  ? "border-red-600 focus:border-red-600"
                  : "border-neutral-600 focus:border-white"
                }`}

              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span className="text-lg leading-none">✕</span>
            {error}
          </div>
        )}

        {/* VERIFY BUTTON */}
        <button
          onClick={verifyOtp}
          disabled={loading || otp.length < 6}
          className="w-full h-12 bg-[#e50914] rounded font-semibold text-base hover:bg-[#f6121d] transition disabled:bg-[#e50914]/60 disabled:cursor-not-allowed"
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
