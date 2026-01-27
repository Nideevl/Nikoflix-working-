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

  async function verifyOtp() {
    if (!otp.trim()) return alert("Enter OTP");

    setLoading(true);

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
      alert(data.error || "Invalid OTP");
      return;
    }

    // ✅ move to set password screen
    onVerified(email);
  }

  return (
    <div>
      <h2>Verify OTP</h2>
      <p>OTP sent to <b>{email}</b></p>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />

      <button onClick={verifyOtp} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>

      <p onClick={goBack}>Change email</p>
    </div>
  );
}
