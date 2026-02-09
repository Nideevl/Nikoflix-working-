"use client";

import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOtpClient() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get("email") || "";

  if (!email) {
    return <div style={{ color: "white", textAlign: "center" }}>No email found</div>;
  }

  return (
    <div style={containerStyle}>
      <VerifyOtpForm
        email={email}
        goBack={() => router.push("/signup")}
        onVerified={(mail) => router.push(`/set-password?email=${mail}`)}
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
