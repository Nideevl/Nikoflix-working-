"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const { adminLogout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    adminLogout();
    router.push("/"); // redirect to home
  }

  return (
    <aside
      style={{
        width: 240,
        background: "#111",
        color: "#fff",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100vh", // 🔥 full height sidebar
        justifyContent: "space-between", // 🔥 push logout to bottom
      }}
    >
      <div>
        <h2 style={{ marginBottom: 20 }}>🎬 NikoFlix Admin</h2>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <li><Link href="/admin/dashboard">📊 Dashboard</Link></li>
          <li><Link href="/admin/content">🎥 Content</Link></li>
          <li><Link href="/admin/users">👤 Users</Link></li>

          <hr style={{ borderColor: "#333", margin: "10px 0" }} />

          <li><Link href="/admin/upload-movie">🎬 Upload Movie</Link></li>
          <li><Link href="/admin/update-movie">📺 Update Movie</Link></li>
          <li><Link href="/admin/upload-series">🎬 Upload Series</Link></li>
          <li><Link href="/admin/update-series">📺 Update Series</Link></li>
        </ul>
      </div>

      {/* 🔥 LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: "10px 14px",
          background: "#e50914",
          border: "none",
          borderRadius: 6,
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🚪 Logout
      </button>
    </aside>
  );
}
