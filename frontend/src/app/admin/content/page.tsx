import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ContentPage() {
  const [content, setContent] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setContent);
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <h1>Content Manager</h1>
        {content.map((c: any) => (
          <div key={c.content_id}>{c.title}</div>
        ))}
      </AdminLayout>
    </AdminGuard>
  );
}
