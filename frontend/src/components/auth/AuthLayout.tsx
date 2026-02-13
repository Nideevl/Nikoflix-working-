import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center" />

      {/* Dark overlay */}
      <div className="absolute inset-0" />

      {/* Top red gradient band */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#5c0000]/80 via-[#5c0000]/10 at-20% to-transparent at-40%" />

      {/* Header */}
      <div className="relative z-10 px-45 py-6">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/logo.svg"
              alt="NIKOFLIX"
              width={150}
              height={40}
              className="h-9.25 w-auto -ml-[3px]"
            />
            <span className="logo-text text-red-600 text-2xl font-extrabold tracking-wide">
              NikoFlix
            </span>
          </div>
        </Link>
      </div>

      {/* Thin separator line */}
      <div className="relative z-10 border-t border-white/10" />

      {/* Center content */}
      <div className="relative z-10 flex items-center justify-center px-4 mt-10">
        {children}
      </div>
    </div>
  );
}