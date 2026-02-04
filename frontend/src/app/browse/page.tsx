"use client";

import { useEffect, useState } from "react";
import Billboard from "@/components/browse/Billboard";
import ContentCarousel from "@/components/browse/ContentCarousel/ContentCarousel";
import ExpandedCardPortal from "@/components/browse/ExpandedCardPortal/ExpandedCardPortal";
import { CardItem } from "@/components/browse/Card/types";
import { useRouter, useSearchParams } from "next/navigation";

type Row = {
  title: string;
  content: any[];
};

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");

  const [rows, setRows] = useState<Row[]>([]);
  const [expandedItem, setExpandedItem] = useState<CardItem | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [scrollY, setScrollY] = useState(0);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    async function fetchRows() {
      const base = process.env.NEXT_PUBLIC_API_BASE;

      const [trending, series, recommended] = await Promise.all([
        fetch(`${base}/content/row?count=36&type=movie`).then(r => r.json()),
        fetch(`${base}/content/row?count=36&type=series`).then(r => r.json()),
        fetch(`${base}/content/row?count=36&type=movie`).then(r => r.json()),
      ]);

      setRows([
        { title: "Trending Now", content: trending },
        { title: "Top Series", content: series },
        { title: "Because you watched…", content: recommended },
      ]);
    }

    fetchRows();
  }, []);

  /* ---------------- OPEN ---------------- */
  const handleOpen = (item: CardItem, rect: DOMRect) => {
    const y = window.scrollY;
    setScrollY(y);

    setExpandedItem(item);
    setOriginRect(rect);

    router.push(`?open=${item.content_id}`, { scroll: false });
  };

  /* ---------------- CLOSE ---------------- */
  const handleClose = () => {
    setExpandedItem(null);
    setOriginRect(null);

    router.push("?", { scroll: false });

    // restore scroll AFTER main becomes static again
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const isOverlayOpen = !!expandedItem;

  return (
    <>
      {/* 🔒 FREEZE / UNFREEZE MAIN */}
      <main
        className={`
          bg-[#141414] text-white 
          ${isOverlayOpen ? "fixed top-0 left-0 w-full" : ""}
        `}
        style={
          isOverlayOpen
            ? { top: `-${scrollY}px` } // critical Netflix trick
            : undefined
        }
      >
        <Billboard />

        <div className="relative -mt-40 space-y-14 overflow-hidden">
          {rows.map((row, index) => (
            <ContentCarousel
              key={`${row.title}-${index}`}
              title={row.title}
              items={row.content}
              openId={openId}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </main>

      {/* 🧬 EXPANDED CARD (FREE SCROLLS) */}
      <ExpandedCardPortal 
        item={expandedItem}
        originRect={originRect}
        onClose={handleClose}
      />
    </>
  );
}
