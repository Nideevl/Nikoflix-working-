"use client";

import { useEffect } from "react";
import styles from "./settingsUI.module.css"

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
                ? `${formatTime(remaining)}`
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

            if (wasPlaying) video.play().catch(() => { });

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
            <div className={styles.nfProgressWrapper}>
                <div className={styles.nfProgressBar} id="nf-progress-bar">
                    <div className={styles.nfProgressBuffered} id="nf-progress-buffered"></div>
                    <div className={styles.nfProgressFill} id="nf-progress-fill"></div>
                    <div className={styles.nfProgressThumb} id="nf-progress-thumb"></div>
                </div>
                <div className={styles.timeToggle} id="timeToggle">00:00:00</div>
            </div>
        </>
    );
}
