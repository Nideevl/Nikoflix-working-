"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SetPasswordForm from "@/components/auth/setPasswordForm";

export default function SetPasswordClient() {
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
    <SetPasswordForm
      email={email}
      goBack={() => router.push(`/verify-otp?email=${email}`)}
      close={() => {
        window.location.href = "/browse";
      }}
    />
  );
}
