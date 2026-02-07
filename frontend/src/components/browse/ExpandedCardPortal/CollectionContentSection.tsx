"use client";

import { useEffect, useState } from "react";
import SimilarCard from "./SimilarCard";
import { SquareLibrary } from "lucide-react";

export default function CollectionContentSection({ item }: { item: any}) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/content/collection/${item.content_id}`
    )
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, [item.content_id]);

  if (!data.length || data.length <= 1) return null;

  return (
    <div className="space-y-6 pt-5">
      {/* HEADER */}
      <div className="flex items-center gap-3 text-white">
        <SquareLibrary
          size={25}
          strokeWidth={2.5}
        />

        <h3
          className="text-2xl font-semibold tracking-wide"
        >
          {item.title} Collection
        </h3>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-4">
        {data.map((d, i) => (
          <SimilarCard key={i} item={d} onClick={()=>{setExpandedItem(d)}} />
        ))}
      </div>
    </div>
  );
}
