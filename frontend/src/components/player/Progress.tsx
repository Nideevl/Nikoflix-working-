import { RefObject } from "react";

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Progress({
  videoRef,
  time,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  time: { current: number; total: number };
}) {
  return (
    <div className="progress">
      <span>
        {fmt(time.current)} / {fmt(time.total)}
      </span>
      <input
        type="range"
        min={0}
        max={time.total || 0}
        value={time.current}
        onChange={(e) => (videoRef.current!.currentTime = Number(e.target.value))}
      />
    </div>
  );
}
