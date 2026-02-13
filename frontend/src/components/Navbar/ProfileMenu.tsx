"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  CreditCard,
  HelpCircle,
  Inbox,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

export default function ProfileMenu() {
  const { token, loading, logout } = useAuth();
  const router = useRouter(); // Next.js equivalent of useNavigate
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  // ⏳ While checking auth, show Sign In button by default
  if (loading || !token) {
    return (
      <Link
        href='/auth?step=login'
        className="flex items-center gap-2 text-white hover:text-red-500 transition animate-pulse"
      >
        <span className="text-sm font-medium">Sign In</span>
      </Link>
    );
  }

  // ✅ If token exists → show profile menu
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* PROFILE ICON */}
      <button className="flex items-center gap-2.5">
        <Image
          src="/profileIcon.svg"
          width={32}
          height={32}
          alt="profile"
          className="rounded"
        />
        <span
          className={`inline-block w-0 h-0 border-x-6 border-x-transparent border-t-6 
          border-t-white transition-transform duration-300 origin-center ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      <div
        className={`absolute right-0 mt-2 w-52 shadow-xl text-sm text-gray-200
        transition-all duration-200 origin-top
        ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}
      >
        <span className="ml-auto block w-0 h-0 border-x-7 mr-7.5 mb-0.5 border-x-transparent border-b-7 border-b-white" />

        <div
          className="bg-black/90 backdrop-blur-md"
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            border: "1.5px solid rgb(38, 38, 38)",
          }}
        >
          <div className="p-3 space-y-3">
            <MenuItem icon={<Inbox size={22} strokeWidth={2.5} />} text="Requests" />
            <MenuItem icon={<Heart size={22} strokeWidth={2.5} />} text="Liked" />
            <MenuItem icon={<ShoppingCart size={22} strokeWidth={2.5} />} text="Purchases" />
            <MenuItem icon={<CreditCard size={22} strokeWidth={2.5} />} text="Subscription" />
            <MenuItem icon={<HelpCircle size={22} strokeWidth={2.5} />} text="Help Centre" />
          </div>

          <div style={{ borderTop: "0.5px solid rgb(64, 64, 64)" }} />

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="w-full group flex justify-center hover:text-white cursor-pointer transition px-4 py-3"
          >
            <span className="group-hover:underline group-hover:underline-offset-1">
              Sign out of Nikoflix
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="group flex items-center gap-3 hover:text-white cursor-pointer transition pl-1">
      {icon}
      <span className="group-hover:underline group-hover:underline-offset-1">
        {text}
      </span>
    </div>
  );
}