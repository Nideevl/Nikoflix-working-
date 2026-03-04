"use client";

import { useEffect } from "react";
import Billboard from "@/components/browse/Billboard";
import ContentCarousel from "@/components/browse/ContentCarousel/ContentCarousel";
import ExpandedCardPortal from "@/components/browse/ExpandedCardPortal/ExpandedCardPortal";
import ReadyCarousel from "@/components/browse/ReadyCarousel/ReadyCarousel";
import { CardItem } from "@/components/browse/Card/types";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { useBrowseContext } from "@/context/BrowseContext";

export default function BrowseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");

  const {
    rows,
    setRows,
    browseScrollY,
    setBrowseScrollY,
    expandedItem,
    setExpandedItem,
    originRect,
    setOriginRect,
    modalScrollY,
    setModalScrollY,
    hasInitialized,
  } = useBrowseContext();

  /* ---------------- 📍 SAVE SCROLL BEFORE LEAVING ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (!expandedItem) {
        setBrowseScrollY(currentScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [expandedItem, setBrowseScrollY, browseScrollY]);

  /* ---------------- 📍 RESTORE SCROLL ON MOUNT ---------------- */
  useEffect(() => {

    if (browseScrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, browseScrollY);
      });
    }
  }, []); // Only on mount

  /* ---------------- URL → OPEN MODAL DIRECTLY ---------------- */
  useEffect(() => {
    async function fetchContentDetails() {

      if (!openId) return;
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

  /* ---------------- FETCH ROWS (ONCE GLOBALLY) ---------------- */
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function fetchRows() {
      const base = process.env.NEXT_PUBLIC_API_BASE;

      const [trending, series, recommended, readyContent] = await Promise.all([
        fetch(`${base}/content/row?count=36&type=movie`).then(r => r.json()),
        fetch(`${base}/content/row?count=36&type=movie`).then(r => r.json()),
        fetch(`${base}/content/row?count=36&type=movie`).then(r => r.json()),
        fetch(`${base}/content/ready`).then(r => r.json()),  // 👈 new
      ]);

      setRows([
        { title: "Ready to Watch", content: readyContent },  // 👈 new
        { title: "Trending Now", content: trending },
        { title: "You Might Like these too…", content: series },
        { title: "No Titles left", content: recommended },
      ]);
    }

    fetchRows();
  }, [hasInitialized, setRows]);

  /* ---------------- OPEN ---------------- */
  const handleOpen = (item: CardItem, rect: DOMRect | null) => {

    const y = window.scrollY;
    setModalScrollY(y);


    setExpandedItem(item);
    setOriginRect(rect);

    router.replace(`?open=${item.content_id}`, { scroll: false });
  };

  /* ---------------- CLOSE ---------------- */
  const handleClose = () => {
    setExpandedItem(null);
    setOriginRect(null);

    router.replace("?", { scroll: false });

    if (modalScrollY) {
      requestAnimationFrame(() => {
        window.scrollTo(0, modalScrollY);
      });
    }
    setModalScrollY(0);
  };

  const isOverlayOpen = !!expandedItem;

  return (
    <>
      <main
        className={`
          bg-[#141414] text-white 
          ${isOverlayOpen ? "fixed top-0 left-0 w-full" : ""}
        `}
        style={
          isOverlayOpen
            ? { top: `-${modalScrollY}px` }
            : undefined
        }
      >
        <Billboard onOpen={handleOpen} />
        <ReadyCarousel
          title="Ready to Watch"
          items={rows[0]?.content}   // the readyContent row
          openId={openId}
          onOpen={handleOpen}
          loading={rows.length === 0}
        />

        {rows.slice(1).map((row, index) => (
          <ContentCarousel
            key={`${row.title}-${index}`}
            title={row.title}
            items={row.content}
            openId={openId}
            onOpen={handleOpen}
          />
        ))}
        <Footer />
      </main>

      <ExpandedCardPortal
        item={expandedItem}
        originRect={originRect}
        onClose={handleClose}
      />
    </>
  );
}
