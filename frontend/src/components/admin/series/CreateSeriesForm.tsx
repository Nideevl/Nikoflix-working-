"use client";

import { useEffect, useState } from "react";
import ParentContentSearch from "@/components/admin/ParentContentSearch";

type Genre = {
  genre_id: number;
  name: string;
};

type SeriesInput = {
  title: string;
  description: string;
  imdb_rating?: number;
  release_date?: string;
  is_premium: boolean;
  price?: number | null;
  genre_ids: number[];
  parent_id?: string | null; // ✅ NEW
  parent_name?: string; // ✅ UI ONLY
};

export default function CreateSeriesForm() {
  const [seriesList, setSeriesList] = useState<SeriesInput[]>([
    { title: "", description: "", is_premium: false, genre_ids: [] },
  ]);

  const [allGenres, setAllGenres] = useState<Genre[]>([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token")
      : null;

  // ✅ Fetch all genres
  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/genres`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAllGenres);
  }, []);

  const updateField = <K extends keyof SeriesInput>(
    index: number,
    field: K,
    value: any
  ) => {
    const updated = [...seriesList];
    if (typeof value === "string") value = value.trim();
    updated[index][field] = value;
    setSeriesList(updated);
  };

  const toggleGenre = (index: number, genreId: number) => {
    const updated = [...seriesList];
    const current = updated[index].genre_ids;

    updated[index].genre_ids = current.includes(genreId)
      ? current.filter((id) => id !== genreId)
      : [...current, genreId];

    setSeriesList(updated);
  };

  // ✅ Parent selector logic
  const setParent = (index: number, content: any) => {
    const updated = [...seriesList];
    updated[index].parent_id = content.content_id;
    updated[index].parent_name = content.title; // UI only
    setSeriesList(updated);
  };

  const removeParent = (index: number) => {
    const updated = [...seriesList];
    updated[index].parent_id = null;
    updated[index].parent_name = "";
    setSeriesList(updated);
  };

  const addSeries = () => {
    setSeriesList([
      ...seriesList,
      { title: "", description: "", is_premium: false, genre_ids: [] },
    ]);
  };

  const removeSeries = (index: number) => {
    setSeriesList(seriesList.filter((_, i) => i !== index));
  };

  const submit = async () => {
    const payload = seriesList.map((s) => ({
      title: s.title,
      description: s.description,
      imdb_rating: s.imdb_rating,
      release_date: s.release_date,
      is_premium: s.is_premium,
      price: s.price,
      genre_ids: s.genre_ids,
      parent_id: s.parent_id || null, // ✅ send only id
    }));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/series/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ series: payload }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Series created successfully 📺");
      setSeriesList([
        { title: "", description: "", is_premium: false, genre_ids: [] },
      ]);
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>➕ Add New Series</h2>

      {seriesList.map((s, index) => (
        <div
          key={index}
          style={{ border: "1px solid #444", padding: 12, marginBottom: 10 }}
        >
          <h4>Series {index + 1}</h4>

          <input
            placeholder="Series Title"
            value={s.title}
            onChange={(e) => updateField(index, "title", e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={s.description}
            onChange={(e) => updateField(index, "description", e.target.value)}
          />

          {/* ✅ Parent Content UI */}
          <h4>🔗 Parent Content (optional)</h4>

          {s.parent_name && (
            <div style={{ marginBottom: 6 }}>
              Selected Parent: <b>{s.parent_name}</b>
              <button
                onClick={() => removeParent(index)}
                style={{ marginLeft: 10 }}
              >
                ❌ Remove
              </button>
            </div>
          )}

          <ParentContentSearch
            typeFilter="series" // optional
            onSelect={(content) => setParent(index, content)}
          />

          <input
            type="number"
            placeholder="IMDB Rating"
            value={s.imdb_rating || ""}
            onChange={(e) =>
              updateField(index, "imdb_rating", Number(e.target.value))
            }
          />

          <input
            type="date"
            value={s.release_date || ""}
            onChange={(e) =>
              updateField(index, "release_date", e.target.value)
            }
          />

          <label>
            <input
              type="checkbox"
              checked={s.is_premium}
              onChange={(e) =>
                updateField(index, "is_premium", e.target.checked)
              }
            />
            Premium Series
          </label>

          {s.is_premium && (
            <input
              type="number"
              placeholder="Price"
              value={s.price || ""}
              onChange={(e) =>
                updateField(index, "price", Number(e.target.value))
              }
            />
          )}

          {/* ✅ GENRES UI */}
          <h4>🎭 Genres</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {allGenres.map((g) => (
              <label key={g.genre_id} style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={s.genre_ids.includes(g.genre_id)}
                  onChange={() => toggleGenre(index, g.genre_id)}
                />
                {g.name}
              </label>
            ))}
          </div>

          {seriesList.length > 1 && (
            <button onClick={() => removeSeries(index)}>❌ Remove</button>
          )}
        </div>
      ))}

      <button onClick={addSeries}>➕ Add one more series</button>
      <button onClick={submit}>🚀 Create Series</button>
    </div>
  );
}
