"use client";

import SignupForm from "@/components/auth/SignupForm";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  

  return (
    <div style={containerStyle}>
      <SignupForm
        switchMode={() => router.push("/login")}
        onOtp={(email) => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }}
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
