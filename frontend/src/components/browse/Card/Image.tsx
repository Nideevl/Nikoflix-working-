"use client"
import Image from "next/image";
import { useState } from "react";
import { CardItem } from "./types";

export default function CardImage({
    item,
    isHovered,
    onClick,
}: {
    item: CardItem;
    isHovered: boolean;
    onClick?: () => void;
}) {
    const [imgError, setImgError] = useState(false);
    const poster = item.poster_1 || item.poster_url;

    return (
        <div
            className="w-[14.85vw] rounded-[4px] overflow-hidden shadow-md cursor-pointer"
            onClick={onClick}
        >
            {poster && !imgError ? (
                <div className="relative w-[14.85vw] h-[19vh] overflow-hidden rounded-[4px]">
                    {/* Gradient overlay + title */}
                    <div className="absolute inset-0 z-1 pointer-events-none">
                        <span className="
    h-full w-full
    px-2 py-2
    text-neutral-300 text-sm font-medium
    line-clamp-2
    flex items-center justify-center text-center
">
                            {item.title}
                        </span>
                    </div>
                    {/* Image fills the fixed container */}
                    <Image
                        src={poster}
                        alt={item.title}
                        fill
                        className="object-cover z-10"
                        onError={() => setImgError(true)}
                    />
                </div>
            ) : (
                <div className="w-[14.85vw] h-[19vh] bg-black flex items-center justify-center rounded-[4px] p-4">
                </div>
            )}
            {/* <div className="mt-2 px-1.5 flex justify-between items-center">
                <span className="text-white truncate max-w-[75%]">{item.title}</span>
                <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full">
                    {rating}
                </span>
            </div> */}
        </div>
    );
}