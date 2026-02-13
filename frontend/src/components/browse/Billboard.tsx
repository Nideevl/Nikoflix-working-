"use client";

import Image from "next/image";
import {
  Play,
  Info,
  CloudDownload,
  RefreshCcwDot,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardItem } from "@/components/browse/Card/types";
import { useBrowseContext } from "@/context/BrowseContext";

type BillboardProps = {
  type?: "movies" | "series";
  onOpen?: (item: CardItem, rect: DOMRect | null) => void;
};

export default function Billboard({ type, onOpen }: BillboardProps) {
  const router = useRouter();

  const {
    billboardItems,
    setBillboardItems,
    billboardActiveIndex,
    setBillboardActiveIndex,
    hasInitialized,
  } = useBrowseContext();

  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  // 🔥 playback / ingest states (same as ExpandedActions)
  const [loadingPlayback, setLoadingPlayback] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string>("NOT_READY");

  /* ---------------- FETCH BILLBOARD (ONCE GLOBALLY) ---------------- */
  useEffect(() => {
    // ✅ Only fetch if not already initialized
    if (hasInitialized.current && billboardItems.length > 0) {
      setLoading(false);
      return;
    }

    async function fetchBillboard() {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/content/row?count=5${
            type ? `&type=${type}` : ""
          }`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data.length > 0) {
          setBillboardItems(data);
          const index = Math.floor(Math.random() * data.length);
          setBillboardActiveIndex(index);
          setIngestStatus(data[index]?.ingest_status ?? "NOT_READY");
        }
      } catch (err) {
        console.error("Billboard fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBillboard();
  }, [type]); // Intentionally omit context dependencies to prevent loops

  /* ---------------- SYNC INGEST STATE WHEN ACTIVE CHANGES ---------------- */
  useEffect(() => {
    if (!billboardItems.length) return;
    setIngestStatus(billboardItems[billboardActiveIndex]?.ingest_status ?? "NOT_READY");
  }, [billboardActiveIndex, billboardItems]);

  const handleImageError = (contentId: string) => {
    setImgErrors(prev => new Set(prev).add(contentId));
  };

  if (loading || billboardItems.length === 0) {
    return (
      <section
        className="w-full bg-black animate-pulse"
        style={{
          height: "56.25vw",
          minHeight: "420px",
        }}
      />
    );
  }

  const active = billboardItems[billboardActiveIndex];

  /* ---------------- PLAY / PREPARE HANDLER ---------------- */
  const handlePrimaryClick = async () => {
    const mediaId = active?.movie_or_episode_id;
    if (!mediaId || loadingPlayback) return;

    setLoadingPlayback(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/play/movie/${mediaId}`
      );

      const data = await res.json();

      if (data.status === "READY") {
        setIngestStatus("READY");

        router.push(
          `/playback/movie/${mediaId}?src=${encodeURIComponent(data.source)}`
        );
        return;
      }

      if (data.status === "PREPARING") {
        setIngestStatus("PREPARING");
      }
    } catch (err) {
      console.error("Playback error:", err);
    } finally {
      setLoadingPlayback(false);
    }
  };

  /* ---------------- PRIMARY BUTTON STATE MACHINE ---------------- */
  const primaryAction = (() => {
    switch (ingestStatus) {
      case "READY":
        return {
          label: "Play",
          Icon: Play,
          disabled: false,
        };

      case "PREPARING":
      case "INGESTING":
        return {
          label: "Preparing",
          Icon: RefreshCcwDot,
          disabled: true,
        };

      case "NOT_READY":
      default:
        return {
          label: "Prepare",
          Icon: CloudDownload,
          disabled: false,
        };
    }
  })();

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{
        height: "56.25vw",
        minHeight: "420px",
        marginBottom: "-18vw",
      }}
    >
      {/* BACKDROP */}
      {active.poster_2 && (
        <Image
          src={active.poster_2}
          alt=""
          fill
          priority
          className="object-cover"
        />
      )}

      {/* VIGNETTES */}
      <div className="trailer-vignette vignette-layer" />
      <div className="absolute top-0 h-[15%] w-full bg-gradient-to-b from-black/40 to-transparent z-[6]" />
      <div className="bottom-fadder" />

      {/* MAIN CONTENT */}
      <div className="absolute bottom-[35%] left-0 px-15 max-w-2xl space-y-4 z-[10]">
        <h1
          className="text-5xl font-extrabold leading-tight text-white"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          {active.title}
        </h1>

        <p className="text-gray-100 text-lg line-clamp-3 [text-shadow:2px_2px_4px_rgba(0,0,0,0.45)]">
          {active.description}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-4 mt-6">
          {/* PLAY / PREPARE BUTTON */}
          <button
            onClick={handlePrimaryClick}
            disabled={primaryAction.disabled || loadingPlayback}
            className={`
              flex items-center gap-3 px-6 py-2 rounded font-semibold transition
              ${
                primaryAction.disabled || loadingPlayback
                  ? "bg-neutral-500 text-black cursor-not-allowed"
                  : "bg-white text-black hover:bg-neutral-200"
              }
            `}
          >
            <primaryAction.Icon
              size={22}
              fill={ingestStatus === "READY" ? "black" : "none"}
              className={
                ingestStatus === "PREPARING" || ingestStatus === "INGESTING"
                  ? "spin-reverse"
                  : ""
              }
            />

            {primaryAction.label}
          </button>

          {/* MORE INFO */}
          <button
            className="flex items-center gap-2 bg-gray-500/70 text-white 
            px-6 py-2 rounded font-semibold hover:bg-gray-500/90 transition"
            onClick={() => onOpen?.(active as CardItem, null)}
          >
            <Info size={20} />
            More Info
          </button>
        </div>
      </div>

      {/* RIGHT SELECTORS */}
      <div className="absolute right-8 bottom-[30%] flex flex-col gap-3 z-[20]">
        {billboardItems.map((item, index) => {
          const hasError = imgErrors.has(item.content_id);
          const imageSrc = item.backdrop || item.poster_1 || item.poster_2;

          return (
            <button
              key={item.content_id}
              onClick={() => setBillboardActiveIndex(index)}
              className={`relative w-34 h-18 rounded overflow-hidden border-1 
              transition-all duration-300
              ${
                index === billboardActiveIndex
                  ? "border-white scale-[1.02]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {imageSrc && !hasError ? (
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  priority
                  className="object-cover"
                  onError={() => handleImageError(item.content_id)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black-800 flex items-center justify-center text-neutral-200 text-xs p-2 text-center">
                  {item.title}
                </div>
              )}

              {index === billboardActiveIndex && (
                <div className="absolute bottom-0 left-0 right-0 h-1" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}