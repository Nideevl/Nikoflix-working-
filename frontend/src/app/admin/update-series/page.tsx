"use client";

import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import SeriesSearch from "@/components/admin/series/SeriesSearch";
import SeriesEditor from "@/components/admin/series/SeriesEditor";

export default function UpdateSeriesPage() {
  const [series, setSeries] = useState<any>(null);

  return (
    <AdminGuard>
      <AdminLayout>
        <h1>✏️ Update Series</h1>

        <SeriesSearch onSelect={setSeries} />

        {series && <SeriesEditor series={series} />}
      </AdminLayout>
    </AdminGuard>
  );
}
