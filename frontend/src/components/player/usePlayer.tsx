import { useEffect } from "react";
import Hls from "hls.js";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { createRoot } from "react-dom/client";
import type { LucideIcon } from "lucide-react";

export default function usePlayer(movie_id?: string) {
  useEffect(() => {
    if (!movie_id) return;

    const video = document.getElementById("video") as HTMLVideoElement | null;
    const player = document.getElementById("player") as HTMLDivElement | null;
    const overlay = document.getElementById("overlay") as HTMLDivElement | null;

    const volumeIconEl = document.getElementById("volumeIcon") as HTMLSpanElement | null;
    const volumeBtn = document.getElementById("volumeBtn") as HTMLButtonElement | null;
    const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement | null;
    const playBtn = document.getElementById("play") as HTMLButtonElement | null;
    const skipBack = document.getElementById("skipBack") as HTMLDivElement | null;
    const skipForward = document.getElementById("skipForward") as HTMLDivElement | null;

    const fsBtn = document.getElementById("fs") as HTMLButtonElement | null;

    const centerPlay = document.getElementById("centerPlay") as HTMLDivElement | null;

    if (!video || !player || !overlay) return;

    const source = `https://nikoflix.b-cdn.net/movie/${movie_id}/master.m3u8`;

    let hls: Hls | null = null;
    let uiTimer: any = null;

    // ================= HLS INIT =================
    if (Hls.isSupported()) {
      hls = new Hls({ enableWebVTT: true, renderTextTracksNatively: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      (window as any).__PLAYER_STATE__ = { hls, video };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      (window as any).__PLAYER_STATE__ = { hls, video };

    }

    // ================= UI SHOW / HIDE =================
    function showUI() {
      if ((window as any).__SHOW_UI__) {
        (window as any).__SHOW_UI__(true);
      }

      clearTimeout(uiTimer);

      // keep UI visible when paused
      if (video?.paused) return;

      uiTimer = setTimeout(() => {
        if ((window as any).__SHOW_UI__) {
          (window as any).__SHOW_UI__(false);
        }
      }, 3000);
    }

    player.addEventListener("mousemove", showUI);
    player.addEventListener("click", showUI);

    video.addEventListener("pause", () => {
      if ((window as any).__SHOW_UI__) {
        (window as any).__SHOW_UI__(true);
      }
    });

    video.addEventListener("play", showUI);

    // ================= PLAY / PAUSE =================
    function togglePlay() {
      if (!video) return;

      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }

      showUI();

      if (centerPlay) {
        centerPlay.style.opacity = "1";
        centerPlay.textContent = video.paused ? "▶" : "❚❚";
        setTimeout(() => {
          if (centerPlay) centerPlay.style.opacity = "0";
        }, 600);
      }
    }

    // IMPORTANT: prevent UI buttons from pausing video
    player.onclick = (e: any) => {
      const el = e.target as HTMLElement;

      // ✅ if click is inside any UI element, don't toggle play
      if (el.closest("[data-player-ui]") || el.closest("button")) return;

      togglePlay();
    };


    if (playBtn) playBtn.onclick = togglePlay;

    // ================= SKIP BUTTONS =================
    function animateButton(el: HTMLElement | null) {
      if (!el) return;
      el.style.transform = "scale(1.25)";
      setTimeout(() => {
        el.style.transform = "scale(1)";
      }, 150);
    }

    if (skipBack) {
      skipBack.onclick = (e) => {
        e.stopPropagation();
        video.currentTime -= 10;
        animateButton(skipBack);
        showUI();
      };
    }

    if (skipForward) {
      skipForward.onclick = (e) => {
        e.stopPropagation();
        video.currentTime += 10;
        animateButton(skipForward);
        showUI();
      };
    }

    // ================= VOLUME ICON =================
    let volumeRoot: any = null;

    function renderVolumeIcon(Icon: LucideIcon) {
      if (!volumeIconEl) return;
      if (!volumeRoot) volumeRoot = createRoot(volumeIconEl);
      volumeRoot.render(<Icon fill="white" stroke="white" size={24} />);
    }

    function updateVolumeIcon() {
      if (!video) return;

      if (video.muted || video.volume === 0) renderVolumeIcon(VolumeX);
      else if (video.volume < 0.5) renderVolumeIcon(Volume1);
      else renderVolumeIcon(Volume2);
    }

    if (volumeSlider) {
      volumeSlider.value = String(video.volume);
      volumeSlider.oninput = (e: any) => {
        video.volume = parseFloat(e.target.value);
        video.muted = false;
        updateVolumeIcon();
      };
    }

    if (volumeBtn) {
      volumeBtn.onclick = (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        updateVolumeIcon();
      };
    }

    video.addEventListener("volumechange", updateVolumeIcon);
    updateVolumeIcon();

    // ================= FULLSCREEN =================
    if (fsBtn) {
      fsBtn.onclick = (e) => {
        e.stopPropagation();
        document.fullscreenElement
          ? document.exitFullscreen()
          : player.requestFullscreen();
      };
    }

    // ================= KEYBOARD CONTROLS =================
    function handleKeydown(e: KeyboardEvent) {
      if (!video) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;

        case "ArrowRight":
          video.currentTime += 10;
          showUI();
          break;

        case "ArrowLeft":
          video.currentTime -= 10;
          showUI();
          break;

        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.05);
          video.muted = false;
          updateVolumeIcon();
          showUI();
          break;

        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.05);
          updateVolumeIcon();
          showUI();
          break;
      }
    }

    document.addEventListener("keydown", handleKeydown);

    showUI();

    return () => {
      player.removeEventListener("mousemove", showUI);
      player.removeEventListener("click", showUI);
      document.removeEventListener("keydown", handleKeydown);
      video.removeEventListener("volumechange", updateVolumeIcon);
      if (hls) hls.destroy();
    };
  }, [movie_id]);
}
