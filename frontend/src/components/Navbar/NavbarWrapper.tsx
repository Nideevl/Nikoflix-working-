"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/" ||                  // exact homepage only
    pathname.startsWith("/playback") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin");

  return (
    <Suspense fallback={null}>
      {!hideNavbar && <Navbar />}
    </Suspense>
  );
}
