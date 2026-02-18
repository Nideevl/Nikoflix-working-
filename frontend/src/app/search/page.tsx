"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchExpandedCardPortal from "@/components/browse/ExpandedCardPortal/SearchExpandedCardPortal";
import { CardItem } from "@/components/browse/Card/types";
import Card from "@/components/browse/Card/SearchCard";
import Footer from "@/components/Footer";

/* Netflix-style skeleton card */
function SkeletonCard() {
  return (
    <div className="w-[17.8vw] h-[22.77vh] rounded-[4px] overflow-hidden bg-neutral-800 animate-pulse relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent shimmer" />
    </div>
  );
}

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get("q") || "";

  const [results, setResults] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<CardItem | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [modalScrollY, setModalScrollY] = useState(0);

  /* 🔎 FETCH SEARCH RESULTS */
  useEffect(() => {
    if (!q) return;

    const delay = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/content/search?q=${encodeURIComponent(q)}`
        );

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search fetch error", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [q]);

  /* 🎬 OPEN MODAL (same pattern as carousel) */
  const handleOpen = (item: CardItem, rect: DOMRect | null) => {
    const y = window.scrollY;
    setModalScrollY(y);

    setExpandedItem(item);
    setOriginRect(rect);
  };

  const handleClose = () => {
    setExpandedItem(null);
    setOriginRect(null);

    requestAnimationFrame(() => {
      window.scrollTo(0, modalScrollY);
    });
  };

  const isOverlayOpen = !!expandedItem;

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <main
        className={`
          bg-[#141414] min-h-screen text-white px-14 pt-28
          ${isOverlayOpen ? "fixed top-0 left-0 w-full" : ""}
        `}
        style={
          isOverlayOpen
            ? { top: `-${modalScrollY}px` }
            : undefined
        }
      >
        {/* HEADER */}
        <h1 className="text-xl font-medium text-neutral-200 mb-6 tracking-wide">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : results.length ? (
            <>Results for "<span className="text-white font-normal">{q}</span>"</>
          ) : (
            q && <>No results for "<span className="text-white font-normal">{q}</span>"</>
          )}
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-5">
          {loading ? (
            /* Show 15 skeleton cards while loading */
            Array.from({ length: 15 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            results.map((item, index) => {
              let cardType: "" | "First" | "Last" = "";

              if (index % 5 === 0) cardType = "First";
              else if ((index + 1) % 5 === 0) cardType = "Last";

              return (
                <Card
                  key={item.content_id}
                  cardType={cardType}
                  item={item}
                  isSelected={expandedItem?.content_id === item.content_id}
                  onOpen={handleOpen}
                />
              );
            })
          )}
        </div>
      <Footer />
      </main>

      {/* 🔥 IMPORTANT — OUTSIDE MAIN */}
      <SearchExpandedCardPortal
        item={expandedItem}
        originRect={originRect}
        onClose={handleClose}
      />

    </>
  );
}