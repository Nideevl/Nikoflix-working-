"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ExpandedCardPortal from "@/components/browse/ExpandedCardPortal/ExpandedCardPortal";
import { CardItem } from "@/components/browse/Card/types";
import Card from "@/components/browse/Card/SearchCard"; // ✅ SAME import style as carousel
import Footer from "@/components/Footer";

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
  <h1 className="text-3xl font-bold mb-8">
    {loading
      ? "Searching..."
      : results.length
      ? `Results for "${q}"`
      : `No results for "${q}"`}
  </h1>

  {/* GRID */}
  <div className="grid grid-cols-5 gap-5">
    {results.map((item, index) => {
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
    })}
  </div>
</main>

{/* 🔥 IMPORTANT — OUTSIDE MAIN */}
<ExpandedCardPortal
  item={expandedItem}
  originRect={originRect}
  onClose={handleClose}
/>

<Footer />

    <Footer/>
    </>
  );
}
