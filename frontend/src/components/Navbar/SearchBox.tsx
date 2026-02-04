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

  // 🧠 remember where user came from
  const previousUrlRef = useRef<string | null>(null);

  /* focus input */
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  /* click outside → close only if empty */
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

  /* 🔥 Netflix-style live routing */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim()) {
        // store previous page only once
        if (!previousUrlRef.current) {
          const params = searchParams.toString();
          previousUrlRef.current =
            pathname + (params ? `?${params}` : "");
        }

        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [query]);

  /* ❌ clear search */
  const clearSearch = () => {
    setQuery("");
    setOpen(false);

    if (previousUrlRef.current) {
      router.push(previousUrlRef.current);
      previousUrlRef.current = null; // reset
    } else {
      router.push("/browse");
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        className={`flex items-center  border transition-all duration-300 ease-out
        ${open ? "border-white bg-black w-64 px-2" : "border-transparent w-8 px-1"}
        h-[34px] overflow-hidden`}
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
          className={`bg-transparent text-white text-sm outline-none ml-2 transition-all duration-300
          ${open ? "opacity-100 w-full" : "opacity-0 w-0"}`}
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
