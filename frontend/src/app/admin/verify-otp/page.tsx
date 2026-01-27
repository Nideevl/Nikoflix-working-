
import { useState } from "react";
import { useRouter } from "next/router";

export default function VerifyOtp() {
  const router = useRouter();
  const { email } = router.query;

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
      <input placeholder="User OTP" value={otpUser} onChange={(e) => setOtpUser(e.target.value)} />
      <input placeholder="Admin OTP" value={otpAdmin} onChange={(e) => setOtpAdmin(e.target.value)} />
      <input type="password" placeholder="Set Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={verify}>Verify & Create Admin</button>
    </div>
  );
}
