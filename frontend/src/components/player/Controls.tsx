"use client";

import { RefObject, useEffect, useState } from "react";
import Hls from "hls.js";
import Progress from "./Progress";

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  hlsRef: RefObject<Hls | null>;
  title: string;
}

export default function Controls({ videoRef, hlsRef, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const [levels, setLevels] = useState<Hls.Level[]>([]);
  const [audios, setAudios] = useState<Hls.AudioTrack[]>([]);
  const [subs, setSubs] = useState<Hls.SubtitleTrack[]>([]);
  const [time, setTime] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    if (!video || !hls) return;

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setLevels(hls.levels);
    });

    hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
      setAudios(data.audioTracks);
    });

    hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
      setSubs(data.subtitleTracks);
    });

    const updateTime = () =>
      setTime({
        current: video.currentTime,
        total: video.duration || 0,
      });

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("play", () => setPlaying(true));
    video.addEventListener("pause", () => setPlaying(false));

    return () => {
      video.removeEventListener("timeupdate", updateTime);
    };
  }, []);

  return (
    <div className="controls">
      <div className="title">{title}</div>

      <button onClick={() => (videoRef.current!.paused ? videoRef.current!.play() : videoRef.current!.pause())}>
        {playing ? "❚❚" : "▶"}
      </button>

      <button onClick={() => (videoRef.current!.currentTime -= 10)}>⟪ 10s</button>
      <button onClick={() => (videoRef.current!.currentTime += 10)}>10s ⟫</button>

      <Progress videoRef={videoRef} time={time} />

      <select onChange={(e) => (hlsRef.current!.currentLevel = Number(e.target.value))}>
        <option value={-1}>Auto</option>
        {levels.map((l, i) => (
          <option key={i} value={i}>
            {l.height}p
          </option>
        ))}
      </select>

      <select onChange={(e) => (hlsRef.current!.audioTrack = Number(e.target.value))}>
        {audios.map((a, i) => (
          <option key={i} value={i}>
            {a.lang || a.name || `Track ${i + 1}`}
          </option>
        ))}
      </select>

      <select onChange={(e) => (hlsRef.current!.subtitleTrack = Number(e.target.value))}>
        <option value={-1}>Subtitles Off</option>
        {subs.map((s, i) => (
          <option key={i} value={i}>
            {s.lang}
          </option>
        ))}
      </select>
    </div>
  );
}
