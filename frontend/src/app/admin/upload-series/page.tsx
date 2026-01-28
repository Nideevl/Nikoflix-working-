"use client";

import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import CreateSeriesForm from "@/components/admin/series/CreateSeriesForm";
import UploadEpisodesForm from "@/components/admin/series/UploadEpisodesForm";

export default function UploadSeriesPage() {
  const [tab, setTab] = useState<"create" | "episodes">("create");

  return (
    <AdminGuard>
      <AdminLayout>
        <h1>📺 Series Management</h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setTab("create")}>
            ➕ Create Series
          </button>
          <button onClick={() => setTab("episodes")}>
            🎬 Upload Episodes
          </button>
        </div>

        {tab === "create" && <CreateSeriesForm />}
        {tab === "episodes" && <UploadEpisodesForm />}
      </AdminLayout>
    </AdminGuard>
  );
}
