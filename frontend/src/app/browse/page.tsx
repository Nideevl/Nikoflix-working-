"use client";

import { useEffect, useState } from "react";
import Billboard from "@/components/browse/Billboard";
import ContentCarousel from "@/components/browse/ContentCarousel/ContentCarousel";
import ExpandedCardPortal from "@/components/browse/ExpandedCardPortal/ExpandedCardPortal";
import { CardItem } from "@/components/browse/Card/types";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";

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

  /* ---------------- URL → OPEN MODAL DIRECTLY ---------------- */
useEffect(() => {
  async function fetchContentDetails() {
    if (!openId) return;

    // 🧠 PREVENT LOOP
    if (expandedItem?.content_id === openId) return;

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${base}/content/${openId}`);
      if (!res.ok) return;

      const contentData: CardItem = await res.json();

      handleOpen(contentData, null);
    } catch (err) {
      console.error("Error fetching content details:", err);
    }
  }

  fetchContentDetails();
}, [openId]);


  /* ---------------- FETCH ROWS ---------------- */
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
  const handleOpen = (item: CardItem, rect: DOMRect | null) => {
    // 🔥 only store scroll when animation is needed
    if (rect) {
      const y = window.scrollY;
      setScrollY(y);
    }

    setExpandedItem(item);
    setOriginRect(rect);

    router.replace(`?open=${item.content_id}`, { scroll: false });

    // 🔥 if opened from URL → jump to top
    if (!rect) {
      window.scrollTo({ top: 0 });
    }
  };

  /* ---------------- CLOSE ---------------- */
  const handleClose = () => {
    setExpandedItem(null);
    setOriginRect(null);

    router.replace("?", { scroll: false });

    // restore scroll only when animation existed
    if (scrollY) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
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
            ? { top: `-${scrollY}px` }
            : undefined
        }
      >
        <Billboard />

          {rows.map((row, index) => (
            <ContentCarousel
              key={`${row.title}-${index}`}
              title={row.title}
              items={row.content}
              openId={openId}
              onOpen={handleOpen}
            />
          ))}
        <Footer/>
      </main>

      {/* 🧬 EXPANDED CARD */}
      <ExpandedCardPortal
        item={expandedItem}
        originRect={originRect}
        onClose={handleClose}
      />
    </>
  );
}
