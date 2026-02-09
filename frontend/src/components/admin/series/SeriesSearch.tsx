"use client";

import { useEffect, useState } from "react";

export default function SeriesSearch({ onSelect }: { onSelect: (s: any) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query) return;

    const token = localStorage.getItem("admin_token");

    const res = fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/series/search?q=${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(setResults);
    console.log("respnse ",res);
  }, [query]);

  return (
    <div>
      <input
        placeholder="Search series title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div style={{ border: "1px solid #444", marginTop: 5 }}>
          {results.map(s => (
            <div
              key={s.content_id}
              style={{ padding: 6, cursor: "pointer" }}
              onClick={() => onSelect(s)}
            >
              {s.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
