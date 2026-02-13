"use client";

import {
    Play,
    Plus,
    ChevronDown,
    AlarmClock,
    CalendarFold,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CardItem } from "./types";

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

    const shouldShow = isHovered || isOpen;

    // controls mount/unmount
    const [isMounted, setIsMounted] = useState(false);

    // controls animation state
    const [animate, setAnimate] = useState(false);

    // opacity animations
    const [imageOpacity, setImageOpacity] = useState(0.5);
    const [infoOpacity, setInfoOpacity] = useState(0);

    /* --------------------------
       HANDLE MOUNT + ANIMATION
    -------------------------- */
    useEffect(() => {
        if (shouldShow) {
            setIsMounted(true);

            requestAnimationFrame(() => {
                setAnimate(true);
                setImageOpacity(1);
                setInfoOpacity(1);
            });
        } else {
            // play closing animation
            setAnimate(false);
            setImageOpacity(0.5);
            setInfoOpacity(0);

            // unmount AFTER animation finishes
            const timeout = setTimeout(() => {
                setIsMounted(false);
            }, 260); // slightly more than transform duration

            return () => clearTimeout(timeout);
        }
    }, [shouldShow]);

    if (!isMounted) return null;

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
                ? "calc(100% - 26.4vw)"
                : "-4.2vw";

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

    return (
        <div
            data-open
            data-type={item.type}
            data-id={item.content_id}
            className="absolute z-[100] rounded-[7px] overflow-hidden"
            style={{
                width: "26.4vw",
                top: "0vh",
                left: leftOffset,
                transformOrigin: origin,
                boxShadow: "0 2vh 4vh rgba(0,0,0,1)",
                background: "#141414",

                transform: animate
                    ? "translateY(-22.8vh) scale(1.015)"
                    : "translateY(0vh) scale(0.68)",

                opacity: animate ? 1 : 0.4,

                transition: animate
                    ? "transform 200ms cubic-bezier(0.3, 0, 0.6, 1), opacity 160ms ease"
                    : "transform 120ms cubic-bezier(0.4, 0, 1, 1), opacity 100ms ease",

            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={onClick}
        >
            {/* IMAGE */}
            <div
                className="relative bg-black"
                style={{
                    height: "28vh",
                    opacity: imageOpacity,
                    transition: "opacity 150ms ease",
                }}
            >
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
                opacity={infoOpacity}
            />
        </div>
    );
}

/* ---------- INFO SECTION ---------- */
function InfoSection({
    item,
    year,
    duration,
    genres,
    opacity,
}: {
    item: CardItem;
    year: string | number;
    duration: string;
    genres: string[];
    opacity: number;
}) {
    return (
        <div
            className="bg-[#141414]"
            style={{
                padding: "2vh 1.2vw",
                opacity,
                transition: "opacity 250ms ease",
            }}
        >
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
