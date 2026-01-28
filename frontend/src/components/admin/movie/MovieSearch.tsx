"use client";

import { useEffect, useState } from "react";

type Movie = {
  content_id: string;
  title: string;
};

export default function MovieSearch({
  onSelect,
}: {
  onSelect: (movie: Movie) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]); // ✅ typed

  useEffect(() => {
    if (!query) return;

    const token = localStorage.getItem("admin_token");

    fetch(`http://localhost:5000/admin/movies/search?q=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: Movie[]) => setResults(data)); // ✅ typed
  }, [query]);

  return (
    <div>
      <input
        placeholder="Search movie title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div style={{ border: "1px solid #444", marginTop: 5 }}>
          {results.map((m) => (
            <div
              key={m.content_id}
              style={{ padding: 6, cursor: "pointer" }}
              onClick={() => onSelect(m)}
            >
              🎬 {m.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
