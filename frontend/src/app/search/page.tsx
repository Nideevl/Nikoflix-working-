"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ExpandedCardPortal from "@/components/browse/ExpandedCardPortal/ExpandedCardPortal";
import { CardItem } from "@/components/browse/Card/types";
import Image from "next/image";
import { useBrowseContext } from "@/context/BrowseContext";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const openId = params.get("open");
  const router = useRouter();

  const {
    searchResults,
    setSearchResults,
    searchLoading,
    setSearchLoading,
    expandedItem,
    setExpandedItem,
    setOriginRect,
    modalScrollY,
    setModalScrollY,
    browseScrollY, // Remember where we were in browse
  } = useBrowseContext();

  /* ---------------- 🔍 FETCH SEARCH RESULTS ---------------- */
  useEffect(() => {
    if (!q) return;

    const delay = setTimeout(async () => {
      setSearchLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/content/search?q=${encodeURIComponent(q)}`
        );

        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search fetch error", err);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [q, setSearchResults, setSearchLoading]);

  /* ---------------- 🎭 URL → OPEN MODAL DIRECTLY ---------------- */
  useEffect(() => {
    async function fetchContentDetails() {
      if (!openId) return;
      if (expandedItem?.content_id === openId) return;

      try {
        const base = process.env.NEXT_PUBLIC_API_BASE;
        const res = await fetch(`${base}/content/${openId}`);
        if (!res.ok) return;

        const contentData: CardItem = await res.json();
        handleOpen(contentData);
      } catch (err) {
        console.error("Error fetching content details:", err);
      }
    }

    fetchContentDetails();
  }, [openId]);

  /* ---------------- OPEN MODAL ---------------- */
  const handleOpen = (item: CardItem) => {
    setModalScrollY(window.scrollY);
    setExpandedItem(item);
    setOriginRect(null);

    router.replace(`?q=${q}&open=${item.content_id}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  /* ---------------- CLOSE MODAL ---------------- */
  const handleClose = () => {
    setExpandedItem(null);
    setOriginRect(null);

    router.replace(`?q=${q}`, { scroll: false });

    if (modalScrollY) {
      requestAnimationFrame(() => {
        window.scrollTo(0, modalScrollY);
      });
    }
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
        <h1 className="text-3xl font-bold mb-8">
          {searchLoading
            ? "Searching..."
            : searchResults.length
            ? `Results for "${q}"`
            : `No results for "${q}"`}
        </h1>

        <div className="grid grid-cols-6 gap-6">
          {searchResults.map((item) => {
            const image = item.poster_1 || item.poster_2;

            return (
              <button
                key={item.content_id}
                onClick={() => handleOpen(item)}
                className="relative group"
              >
                <div className="relative w-full h-[240px] rounded overflow-hidden">
                  {image && (
                    <Image
                      src={image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-200">
                  {item.title}
                </p>
              </button>
            );
          })}
        </div>
      </main>

      <ExpandedCardPortal
        item={expandedItem}
        originRect={null}
        onClose={handleClose}
      />
    </>
  );
}