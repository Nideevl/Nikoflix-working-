"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import "@/styles/player.css";

interface Props {
  src: string;
}

export default function Player({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent double init (Strict Mode)
    if (hlsRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWebVTT: true,
        renderTextTracksNatively: true,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.subtitleDisplay = true;

      // ---- EVENTS (same as HTML) ----
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ Manifest parsed");
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        console.log("🎧 Audio tracks:", data.audioTracks);
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
        console.log("💬 Subtitle tracks:", data.subtitleTracks);
      });

      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
        setTimeout(() => {
          const track = video.textTracks[hls.subtitleTrack];
          if (track) track.mode = "showing";
        }, 100);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari fallback
      video.src = src;
    }
  }, [src]);

  return (
    <div className="player">
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
