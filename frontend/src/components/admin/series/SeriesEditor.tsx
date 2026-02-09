"use client";

import { uploadToCloudinary } from "@/lib/cloudinaryUploads";
import { useEffect, useState } from "react";
import EpisodesEditor from "./EpisodesEditor";
import ParentContentSearch from "@/components/admin/ParentContentSearch";

type Genre = {
  genre_id: number;
  name: string;
};

export default function SeriesEditor({ series }: { series: any }) {
  const [form, setForm] = useState<any>({});
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [parentName, setParentName] = useState<string>(""); // ✅ UI only

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token")
      : null;

  useEffect(() => {
    if (series) {
      setForm(series);
      if (series.parent_title) {
        setParentName(series.parent_title); // optional if backend sends it
      }
    }
  }, [series]);

  // ✅ Fetch all genres
  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/genres`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAllGenres);
  }, []);

  // ✅ Fetch series genres
  useEffect(() => {
    if (!series?.content_id || !token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/content/${series.content_id}/genres`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const ids = data.map((g: any) => g.genre_id);
        setSelectedGenres(ids);
      });
  }, [series]);

  const updateField = (key: string, value: any) => {
    if (typeof value === "string") value = value.trim();
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  // ✅ Parent selection handler
  const setParent = (content: any) => {
    updateField("parent_id", content.content_id); // backend only id
    setParentName(content.title); // UI only
  };

  const removeParent = () => {
    updateField("parent_id", null);
    setParentName("");
  };

  const updateSeries = async () => {
    const res = await fetch(
      `NEXT_PUBLIC_API_BASE/admin/content/${form.content_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imdb_rating: form.imdb_rating,
          release_date: form.release_date,
          is_premium: form.is_premium,
          price: form.price,
          poster_1: form.poster_1,
          poster_2: form.poster_2,
          ingest_status: form.ingest_status,
          parent_id: form.parent_id || null, // ✅ send parent id
          genre_ids: selectedGenres, // ✅ send genres
        }),
      }
    );

    const data = await res.json();

    if (res.ok) alert("Series updated ✅");
    else alert(data.error || "Update failed");
  };

  const deleteSeries = async () => {
    const typed = prompt(
      `Type the series title to confirm deletion:\n\n"${form.title}"`
    );

    if (typed !== form.title) {
      alert("Title mismatch. Delete cancelled.");
      return;
    }

    const res = await fetch(
      `NEXT_PUBLIC_API_BASE/admin/series/${form.content_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Series deleted successfully 🗑️");
      setForm({});
      window.location.reload();
    } else {
      alert(data.error || "Delete failed");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>📝 Edit Series</h2>

      <input
        placeholder="Series Title"
        value={form.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={form.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <input
        type="number"
        placeholder="IMDB Rating"
        value={form.imdb_rating || ""}
        onChange={(e) => updateField("imdb_rating", Number(e.target.value))}
      />

      <input
        type="date"
        value={form.release_date?.slice(0, 10) || ""}
        onChange={(e) => updateField("release_date", e.target.value)}
      />

      {/* ✅ Parent Series */}
      <h4>🔗 Parent Series (optional)</h4>

      {parentName && (
        <div style={{ marginBottom: 6 }}>
          Selected Parent: <b>{parentName}</b>
          <button onClick={removeParent} style={{ marginLeft: 10 }}>
            ❌ Remove
          </button>
        </div>
      )}

      <ParentContentSearch
        typeFilter="series"
        onSelect={setParent}
      />

      <label>
        <input
          type="checkbox"
          checked={!!form.is_premium}
          onChange={(e) => updateField("is_premium", e.target.checked)}
        />
        Premium
      </label>

      {form.is_premium && (
        <input
          type="number"
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) => updateField("price", Number(e.target.value))}
        />
      )}

      {/* ✅ GENRES */}
      <h4>🎭 Genres</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {allGenres.map((g) => (
          <label key={g.genre_id} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedGenres.includes(g.genre_id)}
              onChange={() => toggleGenre(g.genre_id)}
            />
            {g.name}
          </label>
        ))}
      </div>

      {/* ✅ Posters */}
      <h4>🎨 Posters</h4>

      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const url = await uploadToCloudinary(file);
          updateField("poster_1", url);
        }}
      />

      {form.poster_1 && <img src={form.poster_1} alt="Poster 1" width={120} />}

      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const url = await uploadToCloudinary(file);
          updateField("poster_2", url);
        }}
      />

      {form.poster_2 && <img src={form.poster_2} alt="Poster 2" width={120} />}

      <select
        value={form.ingest_status || "NOT_READY"}
        onChange={(e) => updateField("ingest_status", e.target.value)}
      >
        <option value="NOT_READY">NOT_READY</option>
        <option value="INGESTING">INGESTING</option>
        <option value="READY">READY</option>
        <option value="EVICTED">EVICTED</option>
      </select>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={updateSeries}>💾 Update Series</button>

        <button
          onClick={deleteSeries}
          style={{
            background: "red",
            color: "white",
            padding: "8px 14px",
            border: "none",
            cursor: "pointer",
          }}
        >
          🗑️ Delete Series
        </button>
      </div>

      <hr />

      <EpisodesEditor contentId={form.content_id} />
    </div>
  );
}
