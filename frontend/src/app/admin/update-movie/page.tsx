"use client";

import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import MovieSearch from "@/components/admin/movie/MovieSearch";
import MovieEditor from "@/components/admin/movie/MovieEditor";

export default function UpdateMoviePage() {
  const [movie, setMovie] = useState<any>(null);

  return (
    <AdminGuard>
      <AdminLayout>
        <h1>🎬 Update Movie</h1>

        <MovieSearch onSelect={setMovie} />

        {movie && <MovieEditor movie={movie} />}
      </AdminLayout>
    </AdminGuard>
  );
}
