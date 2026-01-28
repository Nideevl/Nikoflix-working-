"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email"); // ✅ correct way

  const [otpUser, setOtpUser] = useState("");
  const [otpAdmin, setOtpAdmin] = useState("");
  const [password, setPassword] = useState("");

  const verify = async () => {
    const res = await fetch("http://localhost:5000/admin/signup/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otpUser, otpAdmin, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Admin created successfully");
      router.push("/admin/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h1>Verify OTPs</h1>

      <p>Email: {email}</p>

      <input
        placeholder="User OTP"
        value={otpUser}
        onChange={(e) => setOtpUser(e.target.value)}
      />

      <input
        placeholder="Admin OTP"
        value={otpAdmin}
        onChange={(e) => setOtpAdmin(e.target.value)}
      />

      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={verify}>Verify & Create Admin</button>
    </div>
  );
}
