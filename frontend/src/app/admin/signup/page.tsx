"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignup() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const requestOtp = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/signup/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(`/admin/verify-otp?email=${email}`);
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h1>Admin Signup</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={requestOtp}>Send OTPs</button>
    </div>
  );
}
