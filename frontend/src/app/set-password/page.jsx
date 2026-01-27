"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SetPasswordForm from "@/components/auth/setPasswordForm";

export default function SetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get("email") || "";

  if (!email) {
    return <div style={{ color: "white", textAlign: "center" }}>No email found</div>;
  }

  return (
    <div style={containerStyle}>
      <SetPasswordForm
        email={email}
        goBack={() => router.push(`/verify-otp?email=${email}`)}
        close={() => router.push("/")}
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
