import { Suspense } from "react";
import VerifyOtpClient from "@/components/admin/AdminVerifyOtpClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpClient />
    </Suspense>
  );
}
