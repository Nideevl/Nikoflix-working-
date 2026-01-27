import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/admin/login");
  }, []);

  return <>{children}</>;
}
