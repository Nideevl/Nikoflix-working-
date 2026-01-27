import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

export default function Dashboard() {
  return (
    <AdminGuard>
      <AdminLayout>
        <h1>Admin Dashboard</h1>
        <p>Welcome to NikoFlix Admin Panel</p>
      </AdminLayout>
    </AdminGuard>
  );
}
