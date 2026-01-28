"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import ParentContentSearch from "@/components/admin/ParentContentSearch";

type Genre = {
  genre_id: number;
  name: string;
};

type MovieInput = {
  title: string;
  description: string;
  source_url: string;
  duration?: number;
  imdb_rating?: number;
  release_date?: string;
  is_premium: boolean;
  price?: number | null;
  genre_ids: number[];
  parent_id?: string | null;
  parent_name?: string;
};

export default function UploadMoviePage() {
  const [movies, setMovies] = useState<MovieInput[]>([
    {
      title: "",
      description: "",
      source_url: "",
      duration: undefined,
      imdb_rating: undefined,
      release_date: "",
      is_premium: false,
      price: null,
      genre_ids: [],
      parent_id: null,
      parent_name: "",
    },
  ]);

  const [genres, setGenres] = useState<Genre[]>([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token")
      : null;

  // ✅ Fetch genres
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/admin/genres", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setGenres);
  }, []);

  const handleChange = <K extends keyof MovieInput>(
    index: number,
    field: K,
    value: any
  ) => {
    const updated = [...movies];

    if (typeof value === "string") value = value.trim();

    updated[index][field] = value;
    setMovies(updated);
  };

  const toggleGenre = (movieIndex: number, genreId: number) => {
    const updated = [...movies];
    const selected = updated[movieIndex].genre_ids;

    updated[movieIndex].genre_ids = selected.includes(genreId)
      ? selected.filter((id) => id !== genreId)
      : [...selected, genreId];

    setMovies(updated);
  };

  const setParent = (index: number, content: any) => {
    const updated = [...movies];
    updated[index].parent_id = content.content_id;
    updated[index].parent_name = content.title;
    setMovies(updated);
  };

  const removeParent = (index: number) => {
    const updated = [...movies];
    updated[index].parent_id = null;
    updated[index].parent_name = "";
    setMovies(updated);
  };

  const addMovie = () => {
    setMovies([
      ...movies,
      {
        title: "",
        description: "",
        source_url: "",
        duration: undefined,
        imdb_rating: undefined,
        release_date: "",
        is_premium: false,
        price: null,
        genre_ids: [],
        parent_id: null,
        parent_name: "",
      },
    ]);
  };

  const removeMovie = (index: number) => {
    setMovies(movies.filter((_, i) => i !== index));
  };

  const submit = async () => {
    const payload = movies.map((m) => ({
      title: m.title,
      description: m.description,
      source_url: m.source_url,
      duration: m.duration,
      imdb_rating: m.imdb_rating,
      release_date: m.release_date,
      is_premium: m.is_premium,
      price: m.price,
      genre_ids: m.genre_ids,
      parent_id: m.parent_id, // ✅ send parent_id only
    }));

    const res = await fetch("http://localhost:5000/admin/movies/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movies: payload }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Movies uploaded successfully 🎬");
      setMovies([
        {
          title: "",
          description: "",
          source_url: "",
          duration: undefined,
          imdb_rating: undefined,
          release_date: "",
          is_premium: false,
          price: null,
          genre_ids: [],
          parent_id: null,
          parent_name: "",
        },
      ]);
    } else {
      alert(data.error);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <h1>🎬 Bulk Upload Movies</h1>

        {movies.map((movie, index) => (
          <div
            key={index}
            style={{ border: "1px solid #333", padding: 15, marginBottom: 15 }}
          >
            <h3>Movie {index + 1}</h3>

            <input
              placeholder="Title"
              value={movie.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
            />

            <textarea
              placeholder="Description"
              value={movie.description}
              onChange={(e) =>
                handleChange(index, "description", e.target.value)
              }
            />

            {/* ✅ Parent Content */}
            <h4>🔗 Parent Content</h4>

            {movie.parent_name && (
              <div style={{ marginBottom: 6 }}>
                Selected Parent: <b>{movie.parent_name}</b>
                <button
                  onClick={() => removeParent(index)}
                  style={{ marginLeft: 10 }}
                >
                  ❌ Remove
                </button>
              </div>
            )}

            <ParentContentSearch
              typeFilter="movie" // optional (remove if you want movies too)
              onSelect={(content) => setParent(index, content)}
            />

            <input
              type="number"
              placeholder="IMDB Rating"
              value={movie.imdb_rating || ""}
              onChange={(e) =>
                handleChange(index, "imdb_rating", Number(e.target.value))
              }
            />

            <input
              type="date"
              value={movie.release_date || ""}
              onChange={(e) =>
                handleChange(index, "release_date", e.target.value)
              }
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={movie.duration || ""}
              onChange={(e) =>
                handleChange(index, "duration", Number(e.target.value))
              }
            />

            <input
              placeholder="Source URL"
              value={movie.source_url}
              onChange={(e) =>
                handleChange(index, "source_url", e.target.value)
              }
            />

            {/* ✅ Genres */}
            <h4>🎭 Genres</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {genres.map((g) => (
                <label key={g.genre_id}>
                  <input
                    type="checkbox"
                    checked={movie.genre_ids.includes(g.genre_id)}
                    onChange={() => toggleGenre(index, g.genre_id)}
                  />
                  {g.name}
                </label>
              ))}
            </div>

            <label>
              <input
                type="checkbox"
                checked={movie.is_premium}
                onChange={(e) =>
                  handleChange(index, "is_premium", e.target.checked)
                }
              />
              Premium
            </label>

            {movie.is_premium && (
              <input
                placeholder="Price"
                type="number"
                value={movie.price || ""}
                onChange={(e) =>
                  handleChange(index, "price", Number(e.target.value))
                }
              />
            )}

            {movies.length > 1 && (
              <button onClick={() => removeMovie(index)}>❌ Remove</button>
            )}
          </div>
        ))}

        <button onClick={addMovie}>➕ Add Another Movie</button>
        <button onClick={submit}>🚀 Upload All Movies</button>
      </AdminLayout>
    </AdminGuard>
  );
}
