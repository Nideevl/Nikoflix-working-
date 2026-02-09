import { Suspense } from "react";
import SetPasswordClient from "@/components/auth/SetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordClient />
    </Suspense>
  );
}
