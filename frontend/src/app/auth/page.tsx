import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthFlow from "@/components/auth/AuthFlow";
import Footer from "@/components/Footer";

export default function AuthPage() {
  return (
    <>
    <AuthLayout>
      <Suspense fallback={
        <div className="text-white text-center">Loading...</div>
      }>
        <AuthFlow />
      </Suspense>
    </AuthLayout>
      <Footer/>
      </>
  );
}