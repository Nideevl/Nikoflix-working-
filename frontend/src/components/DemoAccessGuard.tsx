"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DemoAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Landing page is always accessible
    if (pathname === "/") {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    // Check for demo access code
    const storedCode = localStorage.getItem("demo_access_code");
    const validCode = process.env.NEXT_PUBLIC_DEMO_CODE;

    if (storedCode === validCode) {
      setHasAccess(true);
      setIsChecking(false);
    } else {
      // Redirect to landing page if trying to access protected route
      router.push("/");
    }
  }, [pathname, router]);

  // Show loading screen while checking
  if (isChecking && pathname !== "/") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-600/20 rounded-full mx-auto" />
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-gray-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if no access (will redirect)
  if (!hasAccess && pathname !== "/") {
    return null;
  }

  // Render content if has access or on landing page
  return <>{children}</>;
}   