"use client";

import Image from "next/image";
import { Play, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Content = {
    content_id: string;
    title: string;
    description: string;
    backdrop?: string;
    poster_1?: string;
    poster_2?: string;
};

type BillboardProps = {
    type?: "movies" | "series";
};

export default function Billboard({ type }: BillboardProps) {
    const router = useRouter();
    const [items, setItems] = useState<Content[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imgErrors, setImgErrors] = useState<Set<string>>(new Set()); // Track errors per content


    // 🎯 Fetch 5 random contents
    useEffect(() => {
        async function fetchBillboard() {
            try {
                setLoading(true);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE}/content/row?count=5${type ? `&type=${type}` : ""
                    }`,
                    { cache: "no-store" }
                );

                const data: Content[] = await res.json();
                console.log(data);

                if (data.length > 0) {
                    setItems(data);
                    setActiveIndex(Math.floor(Math.random() * data.length));
                }
            } catch (err) {
                console.error("Billboard fetch error", err);
            } finally {
                setLoading(false);
            }
        }

        fetchBillboard();
    }, [type]);

    const handleImageError = (contentId: string) => {
        setImgErrors(prev => new Set(prev).add(contentId));
    };

    if (loading || items.length === 0) {
        return (
            <section
                className="w-full bg-black animate-pulse"
                style={{
                    height: "56.25vw",
                    minHeight: "420px",
                }}
            />
        );
    }

    const active = items[activeIndex];

    return (
        <section
            className="relative w-full overflow-hidden bg-black"
            style={{
                height: "56.25vw",
                minHeight: "420px",
                marginBottom: "-18vw"
            }}
        >
            {/* 🎬 BACKDROP IMAGE */}
            {active.poster_2 && <Image
                src={active.poster_2}
                alt={""}
                fill
                priority
                className="object-cover"
            />
            }

            {/* 🎭 NETFLIX VIGNETTES */}
            {/* LEFT DARK */}
            <div className="trailer-vignette vignette-layer"></div>
            {/* TOP FADE */}
            <div className="absolute top-0 h-[15%] w-full bg-gradient-to-b from-black/40 to-transparent z-[6]" />

            {/* BOTTOM FADE */}
            <div className="bottom-fadder" />

            {/* 🎬 MAIN CONTENT */}
            <div className="absolute bottom-[35%] left-0 px-15 max-w-2xl space-y-4 z-[10]">
                <h1
                    className="text-5xl font-extrabold leading-tight text-white"
                    style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                    {active.title}
                </h1>
                <p className="text-gray-100 text-lg line-clamp-3 [text-shadow:2px_2px_4px_rgba(0,0,0,0.45)]">
                    {active.description}
                </p>

                <div className="flex items-center gap-4 mt-6">
                    <button
                        className="flex items-center gap-2 bg-white text-black 
            px-6 py-2 rounded font-semibold hover:bg-white/90 transition"
                        onClick={() => router.push(`/watch/${active.content_id}`)}
                    >
                        <Play fill="black" size={20} />
                        Play
                    </button>

                    <button
                        className="flex items-center gap-2 bg-gray-500/70 text-white 
            px-6 py-2 rounded font-semibold hover:bg-gray-500/90 transition"
                    >
                        <Info size={20} />
                        More Info
                    </button>
                </div>
            </div>

            {/* 🎞 RIGHT SIDE SELECTORS */}
            <div className="absolute right-8 bottom-[30%] flex flex-col gap-3 z-[20]">
                {items.map((item, index) => {
                    const hasError = imgErrors.has(item.content_id);
                    const imageSrc = item.backdrop || item.poster_1 || item.poster_2; // Use item's own images

                    return (
                        <button
                            key={item.content_id}
                            onClick={() => setActiveIndex(index)}
                            className={`relative w-34 h-18 rounded overflow-hidden border-1 
              transition-all duration-300
              ${index === activeIndex
                                    ? "border-white scale-[1.02]"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            {imageSrc && !hasError ? (
                                <Image
                                    src={imageSrc}
                                    alt={item.title}
                                    fill
                                    priority
                                    className="object-cover"
                                    onError={() => handleImageError(item.content_id)}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black-800 flex items-center justify-center text-neutral-200 text-xs p-2 text-center">
                                    {item.title}
                                </div>
                            )}

                            {/* Active indicator */}
                            {index === activeIndex && (
                                <div className="absolute bottom-0 left-0 right-0 h-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}