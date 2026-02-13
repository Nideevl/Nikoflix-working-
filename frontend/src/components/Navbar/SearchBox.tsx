"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ---------------- INITIALIZE FROM URL ---------------- */
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setOpen(true);
    }
  }, []); // Only on mount

  /* ---------------- FOCUS INPUT ---------------- */
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !query.trim() &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [query]);

  /* ---------------- 🔥 LIVE SEARCH ---------------- */
  useEffect(() => {
    const delay = setTimeout(() => {
      const trimmed = query.trim();

      if (trimmed.length > 0) {
        // ✅ Navigate to /search route
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else if (pathname === "/search") {
        // ✅ Go back to /browse when cleared
        router.push("/browse");
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [query, pathname, router]);

  /* ---------------- ❌ CLEAR SEARCH ---------------- */
  const clearSearch = () => {
    setQuery("");
    setOpen(false);
    
    if (pathname === "/search") {
      router.push("/browse");
    }
  };

  /* ---------------- HANDLE BROWSER BACK BUTTON ---------------- */
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      
      if (q) {
        setQuery(q);
        setOpen(true);
      } else {
        setQuery("");
        setOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        className={`
          flex items-center border transition-all duration-300 ease-out
          ${open ? "border-white bg-black w-64 px-2" : "border-transparent w-8 px-1"}
          h-[34px] overflow-hidden
        `}
      >
        {/* 🔍 ICON */}
        <button
          onClick={() => setOpen(true)}
          className="text-gray-100 hover:text-white transition shrink-0"
        >
          <Search size={22} />
        </button>

        {/* INPUT */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Titles, people, genres"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`
            bg-transparent text-white text-sm outline-none ml-2 transition-all duration-300
            ${open ? "opacity-100 w-full" : "opacity-0 w-0"}
          `}
        />

        {/* ❌ CLEAR */}
        {query && open && (
          <button
            onClick={clearSearch}
            className="text-gray-300 hover:text-white ml-1 transition"
          >
            <X size={18} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}