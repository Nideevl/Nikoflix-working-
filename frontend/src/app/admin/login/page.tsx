"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("admin_token", data.token);
      router.push("/admin/dashboard");
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <div>
        <h1>Admin Login</h1>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
        <p onClick={() => router.push("/admin/reset-password")}>Forgot password?</p>
        <p onClick={() => router.push("/admin/signup")}>Signup</p>
      </div>
    </div>
  );
}
