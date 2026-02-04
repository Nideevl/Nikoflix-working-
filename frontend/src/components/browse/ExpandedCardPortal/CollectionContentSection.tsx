"use client";

import { useEffect, useState } from "react";
import SimilarCard from "./SimilarCard";

export default function CollectionContentSection({ item }: { item: any }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/content/collection/${item.content_id}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => {});
  }, [item.content_id]);

  if (!data.length) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {item.title} Collection
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {data.map((d, i) => (
          <SimilarCard key={i} item={d} />
        ))}
      </div>
    </div>
  );
}
