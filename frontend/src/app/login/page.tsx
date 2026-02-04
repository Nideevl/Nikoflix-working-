"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div style={containerStyle}>
      <LoginForm
        switchMode={() => router.push("/signup")}
        close={() => window.location.href = "/browse"}
      />
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
};
