"use client";

import { useState } from "react";
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

  async function setPasswordHandler() {
    if (!password || password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    setLoading(true);

    const res = await fetch(  
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/set-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    
    const data = await res.json();
    console.log(data);
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to set password");
      return;
    }

    // ✅ SUCCESS MESSAGE
    alert("Account created successfully 🎉");

    // ✅ AUTO LOGIN (if backend sends token)
    if (data.token) {
      login(data.token);
      localStorage.setItem("token", data.token);
    }

    // ✅ REDIRECT TO HOME
    router.push("/");
    close();
  }

  return (
    <div>
      <h2>Set Password</h2>
      <p>Email: <b>{email}</b></p>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
      />

      <button onClick={setPasswordHandler} disabled={loading}>
        {loading ? "Setting..." : "Create Account"}
      </button>

      <p onClick={goBack}>Back</p>
    </div>
  );
}
