"use client";

import Billboard from "@/components/browse/Billboard";
import Row from "@/components/browse/Row";

export default function MoviesPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Billboard type="movies" />

      <div className="relative -mt-40 space-y-10 px-10">
        <Row title="Popular Movies" type="movies"/>
        <Row title="Top Rated Movies" type="movies"/>
        <Row title="Action Movies" type="movies"/>
        <Row title="Comedy Movies" type="movies"/>
      </div>
    </main>
  );
}
