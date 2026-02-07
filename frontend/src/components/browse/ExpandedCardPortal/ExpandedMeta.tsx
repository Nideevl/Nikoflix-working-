"use client";
import Image from "next/image"

export default function ExpandedMeta({ item }: { item: any }) {
  function getYear(dateString?: string) {
    if (!dateString) return "—";
    return new Date(dateString).getFullYear();
  }

  function minutesToHours(minutes?: number) {
    if (!minutes && minutes !== 0) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  return (
    <div className="relative w-full rounded-md text-neutral-300">
      {/* TOP META LINE */}
      <div className="flex items-center gap-3 text-base mb-4">
        <span className="text-neutral-300 opacity-80">
          {getYear(item.release_date)}
        </span>

        <span className="text-neutral-300 opacity-80">
          {minutesToHours(item.duration_or_episode_count)}
        </span>
        <Image src="/icons/subtitle.ico" alt="Subtitle Available" height={18} width={18} className="opacity-70 mt-0.5"/>
        <span className="px-1.25 py-0.25 text-xs border border-neutral-500 rounded-[2px]">
          HD
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        {/* LEFT */}
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-neutral-200">
            {item.description}
          </p>
        </div>

        {/* RIGHT */}
        <div className="space-y-3 text-sm">
          {/* GENRES */}
          <div>
            <span className="text-neutral-500">Genres:</span>{" "}
            <span className="text-neutral-200 font-medium">
              {(item.genres || []).join(", ")}
            </span>
          </div>

          {/* STATUS */}
          <div>
            <span className="text-neutral-500">Status:</span>{" "}
            <span className="text-neutral-200 font-medium">
              {item.ingest_status === "READY"
                ? "Ready"
                : item.ingest_status === "PREPARING"
                  ? "Preparing"
                  : "Not Yet Prepared"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
