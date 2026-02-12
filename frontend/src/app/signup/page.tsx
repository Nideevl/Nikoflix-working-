"use client";

import SignupForm from "@/components/auth/SignupForm";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#630000] to-black"
      style={{
        backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/7e6a8a42-1ec1-4b39-92a7-608b7470d0cf/IN-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#630000]/90 to-black/90" />
      <div className="relative z-10">
        <SignupForm
          switchMode={() => router.push("/login")}
          onOtp={(email, username) => {
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          }}
        />
      </div>
    </div>
  );
}