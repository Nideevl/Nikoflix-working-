"use client";

import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Providers from "./providers";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/playback");

  return (
    <html lang="en">
      <body>
        <Providers>
          {!hideNavbar && <Navbar />}
          {children}
        </Providers>
      </body>
    </html>
  );
}