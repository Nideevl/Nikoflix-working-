"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const email = params.get("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  async function handleVerify() {
    setLoading(true);
    try {
      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      login(data.token);
      router.replace("/home");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!email) return <p>Invalid access</p>;

  return (
    <>
      <h2>Verify OTP</h2>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="OTP"
      />

      <button onClick={handleVerify} disabled={loading || otp.length !== 6}>
        {loading ? "Verifying..." : "Verify"}
      </button>
    </>
  );
}
