"use client";

import { useEffect, useState } from "react";
import SimilarCard from "./SimilarCard";

export default function SimilarContentSection({ item }: { item: any }) {
  const [count, setCount] = useState(6);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_BASE}/content/similar/${item.content_id}/${count}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => {});
      
  }, [item.content_id, count]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">More Like This</h3>

      <div className="grid grid-cols-3 gap-4">
        {data.map((d, i) => (
          <SimilarCard key={i} item={d} />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setCount(c => c * 2)}
          className="px-6 py-2 bg-neutral-800 rounded"
        >
          Show More
        </button>
      </div>
    </div>
  );
}
