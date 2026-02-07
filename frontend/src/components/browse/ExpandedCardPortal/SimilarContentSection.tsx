"use client";

import { useEffect, useState, useMemo } from "react";
import SimilarCard from "./SimilarCard";
import { ChevronDown, ChevronUp } from "lucide-react";

const PAGE_SIZE = 6;

export default function SimilarContentSection({ item }: { item: any }) {
  const [allData, setAllData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch ONCE
  useEffect(() => {
    if (!item?.content_id) return;

    let cancelled = false;
    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/content/similar/${item.content_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAllData(data || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [item.content_id]);

  // 🔹 Only what should be visible
  const visibleData = useMemo(
    () => allData.slice(0, visibleCount),
    [allData, visibleCount]
  );

  if (!visibleData.length) return null;

  const isExpanded = visibleCount >= allData.length;
  const canToggle = allData.length > PAGE_SIZE;

  return (
    <section className="space-y-5 relative pb-15">
      {/* TITLE */}
      <h3 className="text-xl font-semibold tracking-wide text-white">
        More Like This
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {visibleData.map((d) => (
          <SimilarCard key={d.content_id} item={d} />
        ))}
      </div>

      {/* EXPAND / COLLAPSE */}
      {canToggle && (
        <div
        className={`
          relative flex justify-center transition-all duration-300
          ${isExpanded ? "mt-16" : "-mt-38"}
          `}
          >
          {/* BUTTON */}
          <button
            disabled={loading}
            onClick={() => {
              if (isExpanded) {
                setVisibleCount(PAGE_SIZE);
              } else {
                setVisibleCount((c) =>
                  Math.min(c + PAGE_SIZE, allData.length)
              );
            }
          }}
            className={`
              h-10 w-10 flex items-center justify-center absolute z-10
              rounded-full mt-[2vh]
              border-2 border-neutral-600
              bg-neutral-900/30
              hover:bg-neutral-800
              transition-all duration-300
              disabled:opacity-50
              ${isExpanded ? "mt-0" : ""}
              `}
          >
            {isExpanded ? (
              <ChevronUp className="text-white" size={20} />
            ) : (
              <ChevronDown className="text-white" size={20} />
            )}
          </button>

          {/* SHADE / CUT-OFF MASK */}
          <div
            className={`
              absolute left-0 w-full section-divider 
              h-[10vh]
              transition-all duration-300
              ${isExpanded
                ? "opacity-0 -bottom-[10vh]"
                : "opacity-100 -bottom-[20.1vh]"}
                `}
          />
                <div className="bg-[#181818] h-[20vh] w-full absolute top-[5vh] big"/>
        </div>
      )}
    </section>
  );
}
