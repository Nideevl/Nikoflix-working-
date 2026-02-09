"use client";

import { useEffect, useState } from "react";

type Content = {
  content_id: string;
  title: string;
  type: "movie" | "series";
};

export default function ParentContentSearch({
  onSelect,
  typeFilter,
}: {
  onSelect: (content: Content) => void;
  typeFilter?: "movie" | "series";
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Content[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("admin_token");

    const fetchData = async () => {
      let data: Content[] = [];

      // ✅ Movie search
      if (!typeFilter || typeFilter === "movie") {
        const res = await fetch(
          `NEXT_PUBLIC_API_BASE/admin/movies/search?q=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const movies = await res.json();
        data.push(
          ...movies.map((m: any) => ({
            content_id: m.content_id,
            title: m.title,
            type: "movie",
          }))
        );
      }

      // ✅ Series search
      if (!typeFilter || typeFilter === "series") {
        const res = await fetch(
          `NEXT_PUBLIC_API_BASE/admin/series/search?q=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const series = await res.json();
        data.push(
          ...series.map((s: any) => ({
            content_id: s.content_id,
            title: s.title,
            type: "series",
          }))
        );
      }

      setResults(data);
    };

    fetchData();
  }, [query, typeFilter]);

  return (
    <div style={{ position: "relative" }}>
      <input
        placeholder="Search parent content..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div
          style={{
            border: "1px solid #444",
            marginTop: 5,
            background: "#fff",
            position: "absolute",
            width: "100%",
            zIndex: 10,
          }}
        >
          {results.map((c) => (
            <div
              key={c.content_id}
              style={{ padding: 6, cursor: "pointer" }}
              onClick={() => {
                onSelect(c);
                setQuery("");
                setResults([]);
              }}
            >
              {c.type === "movie" ? "🎬" : "📺"} {c.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
