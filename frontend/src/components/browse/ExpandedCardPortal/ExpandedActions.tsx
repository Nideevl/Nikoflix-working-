"use client";

import {
  Play,
  Plus,
  CloudDownload,
  RefreshCcwDot,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Liked from "@/../public/icons/liked.ico";
import NotLiked from "@/../public/icons/notLiked.ico";

export default function ExpandedActions({ item }: { item: any }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (item.type !== "movie") return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/movie/${item.movie_or_episode_id}`
    )
      .then((res) => res.json())
      .then((data) => setLiked(data.liked))
      .catch(() => {});
  }, [item]);

  // 🔥 PRIMARY ACTION CONFIG
  const primaryAction = (() => {
    switch (item.ingest_status) {
      case "READY":
        return {
          label: "Play",
          Icon: Play,
          disabled: false,
        };

      case "PREPARING":
        return {
          label: "Preparing",
          Icon: RefreshCcwDot,
          disabled: true,
        };

      case "NOT_READY":
      default:
        return {
          label: "Prepare",
          Icon: CloudDownload,
          disabled: false,
        };
    }
  })();

  return (
    <div className="flex flex-col gap-6 text-white">
      {/* TITLE */}
      <h1
        className="text-[3rem] font-extrabold leading-tight tracking-tight"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {item.title}
      </h1>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-4">
        {/* PRIMARY ACTION */}
        <button
          disabled={primaryAction.disabled}
          className={`
            flex items-center gap-3 px-7 py-2 rounded-md font-semibold
            transition
            ${
              primaryAction.disabled
                ? "bg-neutral-500 text-black cursor-not-allowed"
                : "bg-white text-black hover:bg-neutral-200"
            }
          `}
        >
          <primaryAction.Icon
            size={25}
            className={
              item.ingest_status === "PREPARING"
                ? "animate-spin"
                : ""
            }
          />
          <span className="text-lg font-bold" >{primaryAction.label}</span> 
        </button>

        {/* ADD TO LIST */}
          <button className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-neutral-500 bg-gray-800 hover:border-neutral-100 transition duration-100">
              <Plus size={26}/>
          </button>

        {/* LIKE — MOVIES ONLY */}
        {item.type === "movie" && (
          <button className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-neutral-500 bg-gray-800 hover:border-neutral-100 transition duration-100">
            <Image
              src={liked ? Liked : NotLiked}
              alt="like"
              width={20}
              height={22}
            />
          </button>
        )}
      </div>
    </div>
  );
}
