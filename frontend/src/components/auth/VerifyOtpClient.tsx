"use client";

import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOtpClient() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get("email") || "";

  if (!email) {
    return (
      <div className="text-white text-center">
        No email found
      </div>
    );
  }

  return (
    <VerifyOtpForm
      email={email}
      goBack={() => router.push("/signup")}
      onVerified={(mail) => router.push(`/set-password?email=${mail}`)}
    />
  );
}
