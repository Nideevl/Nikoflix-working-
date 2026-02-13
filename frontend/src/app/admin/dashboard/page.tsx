import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

export default function Dashboard() {
  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-4xl font-black text-white mb-2 tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Welcome to NikoFlix Admin Panel
          </p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}