"use client"

import { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);

  const sendOtp = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) setStep(2);
    else alert("Admin not found");
  };

  const reset = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/reset/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword: password }),
    });

    if (res.ok) alert("Password updated");
    else alert("Invalid OTP");
  };

  return (
    <div>
      <h1>Reset Password</h1>

      {step === 1 && (
        <>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={reset}>Reset Password</button>
        </>
      )}
    </div>
  );
}
