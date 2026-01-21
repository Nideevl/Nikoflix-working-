"use client";

export default function ProgressBar({
  current,
  duration,
  onSeek,
}: any) {
  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div
      className="progress"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        onSeek(percent * duration);
      }}
    >
      <div className="progress-filled" style={{ width: `${pct}%` }} />
    </div>
  );
}
