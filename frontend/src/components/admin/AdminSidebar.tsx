import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside style={{ width: 220, background: "#111", color: "#fff", padding: 20 }}>
      <h2>NikoFlix Admin</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link href="/admin/dashboard">Dashboard</Link></li>
        <li><Link href="/admin/content">Content</Link></li>
        <li><Link href="/admin/users">Users</Link></li>
      </ul>
    </aside>
  );
}
