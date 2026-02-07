"use client";

import {
    Play,
    Plus,
    ChevronDown,
    AlarmClock,
    CalendarFold,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CardItem } from "./types";
import { useRouter } from "next/navigation";

export default function ExpandedPreview({
    item,
    isHovered,
    isOpen,
    cardType,
    onEnter,
    onLeave,
    onClick,
}: {
    item: CardItem;
    isHovered: boolean;
    isOpen: boolean;
    cardType: string;
    onEnter: () => void;
    onLeave: () => void;
    onClick?: () => void;
}) {
    const [imgError, setImgError] = useState(false);
    const router = useRouter();

    const poster = item.poster_1 || item.poster_2 || item.poster_url;

    const origin =
        cardType === "First"
            ? "left top"
            : cardType === "Last"
            ? "right top"
            : "center top";

    const leftOffset =
        cardType === "First"
            ? "0vw"
            : cardType === "Last"
            ? "calc(100% - 22vw)"
            : "-3.5vw";

    const year = item.release_date
        ? new Date(item.release_date).getFullYear()
        : "—";

    const formatDuration = (value: any) => {
        if (!value) return "—";
        if (typeof value === "string" && isNaN(Number(value))) return value;

        const totalMinutes = Number(value);
        if (isNaN(totalMinutes) || totalMinutes <= 0) return "—";

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) return `${minutes}min`;
        if (minutes === 0) return `${hours}hr`;

        return `${hours}h ${minutes}m`;
    };

    const duration = formatDuration(item.duration_or_episode_count);
    const genres: string[] = (item.genres || ["Action", "Drama"]).slice(0, 3);

    const shouldShow = isHovered || isOpen;

    return (
        <>
            {/* ================= HOVER MODE ================= */}
            {!isOpen && (
                <div
                    data-open
                    data-type={item.type}
                    data-id={item.content_id}
                    className={`
                        absolute z-[100]
                        rounded-xl overflow-hidden
                        transition-all duration-300 ease-out
                        ${
                            shouldShow
                                ? "opacity-100 scale-110"
                                : "opacity-0 scale-95 pointer-events-none"
                        }
                    `}
                    style={{
                        width: "22vw",
                        top: "-10vh",
                        left: leftOffset,
                        transformOrigin: origin,
                        boxShadow: "0 2vh 4vh rgba(0,0,0,1)",
                        background: "#141414",
                    }}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onClick={onClick}
                >
                    {/* IMAGE */}
                    <div className="relative bg-black" style={{ height: "26vh" }}>
                        {poster && !imgError ? (
                            <Image
                                src={poster}
                                alt={item.title}
                                fill
                                className="object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                                No image
                            </div>
                        )}
                    </div>

                    <InfoSection
                        item={item}
                        year={year}
                        duration={duration}
                        genres={genres}
                    />
                </div>
            )}
        </>
    );
}

/* ---------- INFO SECTION ---------- */
function InfoSection({
    item,
    year,
    duration,
    genres,
}: {
    item: CardItem;
    year: string;
    duration: string;
    genres: string[];
}) {
    return (
        <div className="bg-[#141414]" style={{ padding: "2vh 1.2vw" }}>
            <div className="flex items-center gap-[1vw]">
                <button className="w-[2.8vw] h-[2.8vw] bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition">
                    <Play size={20} className="fill-black" />
                </button>

                <button className="w-[2.8vw] h-[2.8vw] rounded-full flex items-center justify-center border-2 border-neutral-500 hover:border-neutral-100">
                    <Plus />
                </button>

                <button className="w-[2.8vw] h-[2.8vw] rounded-full border-2 border-neutral-500 hover:border-neutral-100 flex items-center justify-center ml-auto">
                    <ChevronDown />
                </button>
            </div>

            <div className="flex justify-between items-top mb-[1vh] mt-[1vh]">
                <h3 className="text-white text-[1.1vw] font-semibold">
                    {item.title}
                </h3>

                <span className="text-[0.8vw] text-neutral-400 flex items-center gap-[0.3vw]">
                    <CalendarFold size={14} strokeWidth={2.5} />
                    {year}
                </span>
            </div>

            <div className="text-[0.8vw] text-neutral-300 mt-[1vh] flex justify-between">
                <div className="max-w-[15vw]">
                    {genres.map((genre, index) => (
                        <span key={genre} className="inline-flex items-start">
                            <span className="text-white font-normal text-[1vw]">
                                {genre}
                            </span>
                            {index < genres.length - 1 && (
                                <span className="text-neutral-500 ml-[0.5vw] mr-[0.5vw] -mt-[0.3vh] text-[1.2vw]">
                                    •
                                </span>
                            )}
                        </span>
                    ))}
                </div>

                <div className="text-neutral-400 flex items-center gap-[0.3vw] absolute right-[1vw]">
                    <AlarmClock size={14} strokeWidth={3} />
                    {duration}
                </div>
            </div>
        </div>
    );
}
