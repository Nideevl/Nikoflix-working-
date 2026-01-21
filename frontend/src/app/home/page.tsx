"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!token) router.replace("/auth/login");
    }, [token]);

    return (
        <main className="bg-black text-white min-h-screen">
            <section className="px-12 py-6">
                <h1 className="text-2xl font-bold mb-4">Trending Now</h1>
                {/* MovieRow component here */}
            </section>
        </main>
    )
}
