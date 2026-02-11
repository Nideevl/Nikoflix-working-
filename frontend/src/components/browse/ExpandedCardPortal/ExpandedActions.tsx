"use client";

import {
  Play,
  Plus,
  CloudDownload,
  RefreshCcwDot,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Liked from "@/../public/icons/liked.ico";
import NotLiked from "@/../public/icons/notLiked.ico";

export default function ExpandedActions({ item }: { item: any }) {
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [loadingPlayback, setLoadingPlayback] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(item.ingest_status);

  const movieId = item?.movie_or_episode_id;
  const type = item?.type;

  /**
   * 🔹 Fetch like state
   */
  useEffect(() => {
    if (type !== "movie" || !movieId) {
      setLiked(false);
      return;
    }

    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/movie/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setLiked(Boolean(data?.liked));
        }
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [movieId, type]);

  /**
   * 🔥 PLAYBACK HANDLER
   */
  const handlePrimaryClick = async () => {
    if (!movieId || loadingPlayback) return;

    setLoadingPlayback(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/play/movie/${movieId}`
      );

      const data = await res.json();

      // READY → go to player
      if (data.status === "READY") {
        setIngestStatus("READY");

        router.push(`/playback/movie/${movieId}`);
        return;
      }

      // NOT READY → ingest triggered
      if (data.status === "PREPARING") {
        setIngestStatus("PREPARING");
      }
    } catch (err) {
      console.error("Playback error:", err);
    } finally {
      setLoadingPlayback(false);
    }
  };

  /**
   * 🔥 PRIMARY ACTION CONFIG (LIVE STATE)
   */
  const primaryAction = (() => {
    switch (ingestStatus) {
      case "READY":
        return {
          label: "Play",
          Icon: Play,
          disabled: false,
          iconClass: "fill-black",
        };

      case "PREPARING":
      case "INGESTING":
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
          onClick={handlePrimaryClick}
          disabled={primaryAction.disabled || loadingPlayback}
          className={`
            flex items-center gap-3 px-7 py-2 rounded-md font-semibold
            transition
            ${primaryAction.disabled || loadingPlayback
              ? "bg-neutral-500 text-black cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200"
            }
          `}
        >
          <primaryAction.Icon
            size={25}
            fill={ingestStatus === "READY" ? "black" : "none"}
            className={ 
              ingestStatus === "PREPARING" || ingestStatus === "INGESTING"
                ? "spin-reverse"
                : ""
            } 
          />
          <span className="text-lg font-bold">
            {primaryAction.label}
          </span>
        </button>

        {/* ADD TO LIST */}
        <button className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-neutral-500 bg-neutral-900 hover:border-neutral-100 transition duration-100">
          <Plus size={26} />
        </button>

        {/* LIKE — MOVIES ONLY */}
        {type === "movie" && (
          <button className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-neutral-500 bg-neutral-900 hover:border-neutral-100 transition duration-100">
            <Image
              src={liked ? Liked : NotLiked}
              alt="like"
              width={20}
              height={22}
              priority
            />
          </button>
        )}
      </div>
    </div>
  );
}
