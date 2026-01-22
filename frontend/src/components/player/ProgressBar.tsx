"use client";

import { useEffect } from "react";

export default function ProgressBar() {
  useEffect(() => {
    const video = document.getElementById("video") as HTMLVideoElement;
    const bar = document.getElementById("nf-progress-bar") as HTMLDivElement;
    const buffered = document.getElementById("nf-progress-buffered") as HTMLDivElement;
    const fill = document.getElementById("nf-progress-fill") as HTMLDivElement;
    const thumb = document.getElementById("nf-progress-thumb") as HTMLDivElement;
    const timeToggle = document.getElementById("timeToggle") as HTMLDivElement;

    if (!video || !bar || !fill || !thumb || !timeToggle || !buffered) return;

    let showRemaining = true;
    let isDragging = false;
    let wasPlaying = false;

    function formatTime(sec: number) {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return (h > 0 ? String(h).padStart(2, "0") + ":" : "") +
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
    }

    function updateBuffered() {
      if (!video.duration || video.buffered.length === 0) return;

      const end = video.buffered.end(video.buffered.length - 1);
      const pct = (end / video.duration) * 100;
      buffered.style.width = pct + "%";
    }

    function updateUI(time: number) {
      if (!video.duration) return;

      const pct = (time / video.duration) * 100;
      fill.style.width = pct + "%";
      thumb.style.left = pct + "%";

      const elapsed = time;
      const remaining = video.duration - elapsed;

      timeToggle.textContent = showRemaining
        ? `-${formatTime(remaining)}`
        : formatTime(elapsed);

      updateBuffered();
    }

    function update() {
      if (!isDragging) updateUI(video.currentTime);
    }

    function getTimeFromEvent(e: MouseEvent) {
      const rect = bar.getBoundingClientRect();
      let pct = (e.clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      return pct * video.duration;
    }

    function seekTo(time: number) {
      video.currentTime = time;
      updateUI(time);
    }

    function startDrag(e: MouseEvent) {
      isDragging = true;
      wasPlaying = !video.paused;
      if (wasPlaying) video.pause();

      seekTo(getTimeFromEvent(e));

      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stopDrag);
    }

    function drag(e: MouseEvent) {
      if (!isDragging) return;
      seekTo(getTimeFromEvent(e));
    }

    function stopDrag(e: MouseEvent) {
      if (!isDragging) return;
      isDragging = false;

      seekTo(getTimeFromEvent(e));

      if (wasPlaying) video.play().catch(() => {});

      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDrag);
    }

    function clickSeek(e: MouseEvent) {
      seekTo(getTimeFromEvent(e));
    }

    function toggleTime() {
      showRemaining = !showRemaining;
      updateUI(video.currentTime);
    }

    video.addEventListener("timeupdate", update);
    video.addEventListener("progress", updateBuffered);
    video.addEventListener("loadedmetadata", () => updateUI(video.currentTime));

    bar.addEventListener("click", clickSeek);
    thumb.addEventListener("mousedown", startDrag);
    timeToggle.addEventListener("click", toggleTime);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("progress", updateBuffered);
      bar.removeEventListener("click", clickSeek);
      thumb.removeEventListener("mousedown", startDrag);
      timeToggle.removeEventListener("click", toggleTime);
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDrag);
    };
  }, []);


  return (
    <>
        <style>
        {`
        .nf-progress-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
        }

        #nf-progress-bar {
          position: relative;
          width: 100%;
          height: 4px;
          background: rgba(103, 103, 103, 1);
          border-radius: 999px;
          cursor: pointer;
          transition: height 0.15s ease;
        }

        #nf-progress-bar:hover {
          height: 6px;
        }

        #nf-progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: #e50914;
          border-radius:100px;
        }

        #nf-progress-thumb {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          background: #e50914;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        #nf-progress-buffered {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: rgba(143,143,143,1);
        }

        #nf-progress-bar:hover #nf-progress-thumb {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.15);
        }

            #timeToggle {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.95);
            cursor: pointer;
            user-select: none;
            min-width: 90px;
            text-align: right;
            font-family: monospace;
            }
      `}
    </style>

    <div className="nf-progress-wrapper">
      <div id="nf-progress-bar">
        <div id="nf-progress-buffered"></div>
        <div id="nf-progress-fill"></div>
        <div id="nf-progress-thumb"></div>
      </div>
      <div id="timeToggle">00:00:00</div>
    </div>
    </>
  );
}
