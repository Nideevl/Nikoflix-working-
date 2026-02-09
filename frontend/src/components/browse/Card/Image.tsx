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
            className={`rounded-md overflow-hidden shadow-md`}
            onClick={onClick}
        >
            {poster && !imgError ? (
                <Image
                    src={poster}
                    alt={item.title}
                    width={230}
                    height={140}
                    className="w-full h-[19vh] object-cover rounded-md"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="h-[19vh] bg-black flex items-center justify-center rounded-md p-4">
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