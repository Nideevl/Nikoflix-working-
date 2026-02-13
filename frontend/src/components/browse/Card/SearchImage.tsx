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
    const rating = item.imdb_rating || "—";

    return (
        <div
            className={`rounded-[4px] overflow-hidden shadow-md`}
            onClick={onClick}
        >
            {poster && !imgError ? (
                <div className="relative h-fit w-fit overflow-hidden rounded-[4px]">

                    {/* Gradient + title (UNDER image) */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]" />

                        <span className="
      absolute bottom-0 left-0 w-full
      px-2 py-2
      text-neutral-300 text-sm font-medium
      bg-gradient-to-t from-black via-black/70 to-transparent
      line-clamp-2
    ">
                            {item.title}
                        </span>
                    </div>

                    {/* Image (ON TOP) */}
                    <Image
                        src={poster}
                        alt={item.title}
                        width={230}
                        height={140}
                        className="relative z-10 w-full h-[22.8vh] object-cover"
                        onError={() => setImgError(true)}
                    />

                </div>


            ) : (
                <div className="h-[22.8vh] bg-black flex items-center justify-center rounded-[4px] p-4">
                    <span className="text-neutral-300 text-gl font-medium text-center line-clamp-2 truncate">
                        {item.title}
                    </span>
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