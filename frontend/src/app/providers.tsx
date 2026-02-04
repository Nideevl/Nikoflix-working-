"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LayoutGroup } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><LayoutGroup>{children}</LayoutGroup></AuthProvider>;
}
