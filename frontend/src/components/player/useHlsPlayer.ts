"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export function usePlayer(src: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = true; // autoplay policy
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.muted = true;
      video.play().catch(() => {});
    }

    video.onplay = () => setPlaying(true);
    video.onpause = () => setPlaying(false);
    video.ontimeupdate = () => setCurrentTime(video.currentTime);
    video.ondurationchange = () => setDuration(video.duration);

    return () => {
      hls?.destroy();
    };
  }, [src]);

  return {
    videoRef,
    playerRef,
    playing,
    currentTime,
    duration,
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (t: number) => {
      if (videoRef.current) videoRef.current.currentTime = t;
    },
    togglePlay: () => {
      if (!videoRef.current) return;
      videoRef.current.paused
        ? videoRef.current.play()
        : videoRef.current.pause();
    },
    fullscreen: () => {
      if (!document.fullscreenElement) {
        playerRef.current?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
  };
}
