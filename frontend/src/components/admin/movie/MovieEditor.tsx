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
  const [uploading, setUploading] = useState<string | null>(null);

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

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/genres`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAllGenres);
  }, []);

  // ✅ Fetch movie genres
  useEffect(() => {
    if (!movie?.content_id || !token) return;

    fetch(`NEXT_PUBLIC_API_BASE/admin/content/${movie.content_id}/genres`, {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, posterType: 'poster_1' | 'poster_2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(posterType);
    try {
      const url = await uploadToCloudinary(file);
      updateField(posterType, url);
    } catch (error) {
      alert(`Failed to upload ${posterType}: ${error}`);
    } finally {
      setUploading(null);
    }
  };

  const updateMovie = async () => {
    try {
      const res = await fetch(
        `NEXT_PUBLIC_API_BASE/admin/movies/${form.content_id}`,
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

      if (res.ok) {
        alert("✅ Movie updated successfully!");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (error) {
      alert("Network error occurred");
    }
  };

  const deleteMovie = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this movie?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `NEXT_PUBLIC_API_BASE/admin/movie/${form.content_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("🗑️ Movie deleted successfully!");
        setForm({});
        window.location.reload();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      alert("Network error occurred");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <span className="text-2xl">🎬</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Edit Movie</h2>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Movie Title
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter movie title"
              value={form.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Duration in minutes"
              value={form.duration || ""}
              onChange={(e) => updateField("duration", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
            placeholder="Movie description"
            value={form.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {/* Parent Content Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔗</span>
            <h4 className="text-lg font-semibold text-gray-800">Parent Content</h4>
          </div>
          
          {form.parent_name ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
              <div>
                <span className="text-sm text-gray-600">Selected Parent:</span>
                <span className="ml-2 font-medium text-gray-800">{form.parent_name}</span>
              </div>
              <button
                onClick={removeParent}
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-3">No parent content selected</p>
          )}

          <ParentContentSearch
            typeFilter="movie"
            onSelect={setParent}
          />
        </div>

        {/* Ratings & Release */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              IMDB Rating
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.0 - 10.0"
              value={form.imdb_rating || ""}
              onChange={(e) => updateField("imdb_rating", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Release Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.release_date ? form.release_date.slice(0, 10) : ""}
              onChange={(e) => updateField("release_date", e.target.value)}
            />
          </div>
        </div>

        {/* Premium Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              checked={!!form.is_premium}
              onChange={(e) => updateField("is_premium", e.target.checked)}
            />
            <span className="text-gray-700 font-medium">Premium Movie</span>
          </label>
          
          {form.is_premium && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Price in USD"
                value={form.price || ""}
                onChange={(e) => updateField("price", Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Genres Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎭</span>
            <h4 className="text-lg font-semibold text-gray-800">Genres</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {allGenres.map((g) => (
              <label
                key={g.genre_id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${
                  selectedGenres.includes(g.genre_id)
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedGenres.includes(g.genre_id)}
                  onChange={() => toggleGenre(g.genre_id)}
                />
                <span className="text-sm font-medium">{g.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Posters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h4 className="text-lg font-semibold text-gray-800">Posters</h4>
            <span className="text-sm text-gray-500 ml-2">(Uploads to Cloudinary)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poster 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-blue-700">Poster 1 (Primary)</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                  Cloudinary
                </span>
              </div>
              
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => handleImageUpload(e, 'poster_1')}
                disabled={uploading === 'poster_1'}
              />
              
              {uploading === 'poster_1' && (
                <div className="mt-3 text-sm text-blue-600 animate-pulse">
                  ⏳ Uploading to Cloudinary...
                </div>
              )}
              
              {form.poster_1 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={form.poster_1}
                    alt="Poster 1"
                    className="w-full max-w-xs rounded-lg shadow-md border"
                  />
                </div>
              )}
            </div>

            {/* Poster 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-green-700">Poster 2 (Secondary)</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                  Cloudinary
                </span>
              </div>
              
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                onChange={(e) => handleImageUpload(e, 'poster_2')}
                disabled={uploading === 'poster_2'}
              />
              
              {uploading === 'poster_2' && (
                <div className="mt-3 text-sm text-green-600 animate-pulse">
                  ⏳ Uploading to Cloudinary...
                </div>
              )}
              
              {form.poster_2 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={form.poster_2}
                    alt="Poster 2"
                    className="w-full max-w-xs rounded-lg shadow-md border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎥</span>
            <h4 className="text-lg font-semibold text-gray-800">Technical Details</h4>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Source URL
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="https://example.com/video.mp4"
              value={form.source_url || ""}
              onChange={(e) => updateField("source_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ingest Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.ingest_status || "NOT_READY"}
              onChange={(e) => updateField("ingest_status", e.target.value)}
            >
              <option value="NOT_READY">NOT_READY</option>
              <option value="INGESTING">INGESTING</option>
              <option value="READY">READY</option>
              <option value="EVICTED">EVICTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
        <button
          onClick={updateMovie}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>💾</span>
          Update Movie
        </button>
        
        <button
          onClick={deleteMovie}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          Delete Movie
        </button>
      </div>
    </div>
  );
}