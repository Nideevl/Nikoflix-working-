"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import SetPasswordForm from "@/components/auth/setPasswordForm";

type AuthStep = "login" | "signup" | "verify-otp" | "set-password";

export default function AuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current step from URL query param
  const step = (searchParams.get("step") as AuthStep) || "login";
  const email = searchParams.get("email") || "";

  const navigate = (newStep: AuthStep, email?: string) => {
    const params = new URLSearchParams();
    params.set("step", newStep);
    if (email) params.set("email", email);
    
    router.replace(`/auth?${params.toString()}`);
  };

  const close = () => {
    window.location.href= '/browse';
  };

  return (
    <>
      {step === "login" && (
        <LoginForm
          switchMode={() => navigate("signup")}
          close={close}
        />
      )}

      {step === "signup" && (
        <SignupForm
          switchMode={() => navigate("login")}
          onOtp={(email) => navigate("verify-otp", email)}
        />
      )}

      {step === "verify-otp" && (
        <VerifyOtpForm
          email={email}
          goBack={() => navigate("signup")}
          onVerified={(email) => navigate("set-password", email)}
        />
      )}

      {step === "set-password" && (
        <SetPasswordForm
          email={email}
          goBack={() => navigate("verify-otp", email)}
          close={close}
        />
      )}
    </>
  );
}