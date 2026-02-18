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
    if (q && pathname === "/search") {
      setQuery(q);
      setOpen(true);
    } else if (pathname !== "/search") {
      // Clear search when navigating away from search page
      setQuery("");
      setOpen(false);
    }
  }, [pathname, searchParams]);

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

  /* ---------------- 🔥 LIVE SEARCH (only on /search page) ---------------- */
  useEffect(() => {
    // CRITICAL: Only perform search navigation if we're already on /search page
    // This prevents hijacking navigation from other pages
    if (pathname !== "/search" && query.trim().length === 0) {
      return; // Don't navigate if not on search page and no query
    }

    const delay = setTimeout(() => {
      const trimmed = query.trim();

      if (trimmed.length > 0) {
        // ✅ Navigate to /search route
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else if (pathname === "/search") {
        // ✅ Go back to /browse when cleared on search page
        router.push("/browse");
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [query]); // Removed pathname and router from dependencies to prevent re-triggering

  /* ---------------- ❌ CLEAR SEARCH ---------------- */
  const clearSearch = () => {
    setQuery("");
    setOpen(false);
    
    if (pathname === "/search") {
      router.push("/browse");
    }
  };

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