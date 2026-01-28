"use client";

import { uploadToCloudinary } from "@/lib/cloudinaryUploads";
import { useEffect, useState } from "react";
import ParentContentSearch from "../ParentContentSearch";

type Genre = {
  genre_id: number;
  name: string;
};

export default function MovieEditor({ movie }: { movie: any }) {
  const [form, setForm] = useState<any>({});
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token")
      : null;

  useEffect(() => {
    if (movie) setForm(movie);
  }, [movie]);

  // ✅ Fetch all genres
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/admin/genres", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAllGenres);
  }, []);

  // ✅ Fetch movie genres
  useEffect(() => {
    if (!movie?.content_id || !token) return;

    fetch(`http://localhost:5000/admin/content/${movie.content_id}/genres`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const ids = data.map((g: any) => g.genre_id);
        setSelectedGenres(ids);
      });
  }, [movie]);

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

  // ✅ Set parent content
  const setParent = (content: any) => {
    setForm((prev: any) => ({
      ...prev,
      parent_id: content.content_id,
      parent_name: content.title, // UI only
    }));
  };

  const removeParent = () => {
    setForm((prev: any) => ({
      ...prev,
      parent_id: null,
      parent_name: "",
    }));
  };

  const updateMovie = async () => {
    const res = await fetch(
      `http://localhost:5000/admin/movies/${form.content_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // content table fields
          title: form.title,
          description: form.description,
          imdb_rating: form.imdb_rating,
          release_date: form.release_date,
          is_premium: form.is_premium,
          price: form.price,
          poster_1: form.poster_1,
          poster_2: form.poster_2,
          ingest_status: form.ingest_status,
          parent_id: form.parent_id, // ✅ IMPORTANT

          // movies table fields
          duration: form.duration,
          source_url: form.source_url,

          // genres
          genre_ids: selectedGenres,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) alert("Movie updated successfully ✅");
    else alert(data.error || "Update failed");
  };

  const deleteMovie = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this movie?");
    if (!confirmDelete) return;

    const res = await fetch(
      `http://localhost:5000/admin/movie/${form.content_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Movie deleted successfully 🗑️");
      setForm({});
      window.location.reload();
    } else {
      alert(data.error || "Delete failed");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>📝 Edit Movie</h2>

      <input
        placeholder="Movie Title"
        value={form.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={form.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      {/* ✅ Parent Content Section */}
      <h4>🔗 Parent Content</h4>

      {form.parent_name && (
        <div style={{ marginBottom: 6 }}>
          Selected Parent: <b>{form.parent_name}</b>
          <button
            onClick={removeParent}
            style={{ marginLeft: 10 }}
          >
            ❌ Remove
          </button>
        </div>
      )}

      <ParentContentSearch
        typeFilter="movie" // optional (remove if you want movies too)
        onSelect={setParent}
      />

      <input
        type="number"
        placeholder="IMDB Rating"
        value={form.imdb_rating || ""}
        onChange={(e) => updateField("imdb_rating", Number(e.target.value))}
      />

      <input
        type="date"
        value={form.release_date ? form.release_date.slice(0, 10) : ""}
        onChange={(e) => updateField("release_date", e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={!!form.is_premium}
          onChange={(e) => updateField("is_premium", e.target.checked)}
        />
        Premium Movie
      </label>

      {form.is_premium && (
        <input
          type="number"
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) => updateField("price", Number(e.target.value))}
        />
      )}

      {/* ✅ GENRES SECTION */}
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

      <h3>🎥 Technical Details</h3>

      <input
        type="number"
        placeholder="Duration (minutes)"
        value={form.duration || ""}
        onChange={(e) => updateField("duration", Number(e.target.value))}
      />

      <input
        placeholder="Source URL"
        value={form.source_url || ""}
        onChange={(e) => updateField("source_url", e.target.value)}
      />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={updateMovie}>💾 Update Movie</button>

        <button
          onClick={deleteMovie}
          style={{
            background: "red",
            color: "white",
            padding: "8px 14px",
            border: "none",
            cursor: "pointer",
          }}
        >
          🗑️ Delete Movie
        </button>
      </div>
    </div>
  );
}
