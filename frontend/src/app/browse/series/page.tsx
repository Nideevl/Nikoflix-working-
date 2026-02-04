"use client";

import Billboard from "@/components/browse/Billboard";
import Row from "@/components/browse/Row";

export default function SeriesPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Billboard type="series" />

      <div className="relative -mt-40 space-y-10 px-10">
        <Row title="Popular Series" type="series"/>
        <Row title="Top Rated Series" type="series"/>
        <Row title="Trending Series" type="series"/>
        <Row title="New Episodes" type="series"/>
      </div>
    </main>
  );
}
