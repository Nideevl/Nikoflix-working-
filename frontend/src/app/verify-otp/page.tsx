import { Suspense } from "react";
import VerifyOtpClient from "@/components/auth/VerifyOtpClient";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div style={{ color: "white", textAlign: "center" }}>Loading...</div>}>
      <VerifyOtpClient />
    </Suspense>
  );
}
