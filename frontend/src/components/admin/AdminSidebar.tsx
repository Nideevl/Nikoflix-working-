"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar() {
  const { adminLogout } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState("/admin/dashboard");

  function handleLogout() {
    adminLogout();
    router.push("/");
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/content", label: "Content", icon: "🎥" },
    { href: "/admin/users", label: "Users", icon: "👤" },
  ];

  const uploadItems = [
    { href: "/admin/upload-movie", label: "Upload Movie", icon: "🎬" },
    { href: "/admin/update-movie", label: "Update Movie", icon: "📺" },
    { href: "/admin/upload-series", label: "Upload Series", icon: "🎬" },
    { href: "/admin/update-series", label: "Update Series", icon: "📺" },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] text-white flex flex-col h-screen border-r border-[#2a2a2a]">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-[#2a2a2a]">
        <h2 className="text-xl font-bold tracking-tight">
          <span className="text-[#e50914]">Niko</span>
          <span className="text-white">Flix</span>
          <span className="text-xs font-normal text-gray-500 block mt-1">Admin Panel</span>
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-8">
          {/* Main Section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Main
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setActive(item.href)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active === item.href
                        ? "bg-[#e50914] text-white shadow-lg shadow-[#e50914]/20"
                        : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Management */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Content Management
            </p>
            <ul className="space-y-1">
              {uploadItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setActive(item.href)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active === item.href
                        ? "bg-[#e50914] text-white shadow-lg shadow-[#e50914]/20"
                        : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#e50914] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 group"
        >
          <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}