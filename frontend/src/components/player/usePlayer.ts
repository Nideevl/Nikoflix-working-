import { useEffect } from "react";
import Hls from "hls.js";

export default function usePlayer(movie_id?: string) {
  useEffect(() => {
    if (!movie_id) return;

    const video = document.getElementById("video") as HTMLVideoElement;
    const player = document.getElementById("player") as HTMLDivElement;
    const overlay = document.getElementById("overlay") as HTMLDivElement;
    const centerPlay = document.getElementById("centerPlay") as HTMLDivElement;

    const playBtn = document.getElementById("play") as HTMLButtonElement;
    const skipBack = document.getElementById("skipBack") as HTMLButtonElement;
    const skipForward = document.getElementById("skipForward") as HTMLButtonElement;
    const volumeBtn = document.getElementById("volumeBtn") as HTMLButtonElement;
    const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
    const fsBtn = document.getElementById("fs") as HTMLButtonElement;

    if (!video || !player) return;

    const source = `https://nikoflix.b-cdn.net/movie/${movie_id}/master.m3u8`;

    let hls: Hls;
    let hideTimer: any;

    function forceSubtitleDisplay() {
      if (hls && hls.subtitleTrack > -1) {
        const track = video.textTracks[hls.subtitleTrack];
        if (track) track.mode = "showing";
      }
    }

    // ✅ HLS INIT
    if (Hls.isSupported()) {
      hls = new Hls({ enableWebVTT: true, renderTextTracksNatively: true });
      (window as any).__PLAYER_STATE__ = {
        hls,
        video,
      };

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.subtitleDisplay = true;

      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () =>
        setTimeout(forceSubtitleDisplay, 100)
      );
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    }

    // ✅ EXPOSE PLAYER API (IMPORTANT)
    (window as any).__PLAYER_API__ = {
      get video() {
        return video;
      },
      get hls() {
        return hls;
      },
      setQuality(level: number) {
        if (hls) hls.currentLevel = level;
      },
      setAudio(track: number) {
        if (hls) hls.audioTrack = track;
      },
      setSubtitle(track: number) {
        if (hls) hls.subtitleTrack = track;
        forceSubtitleDisplay();
      },
      setSpeed(rate: number) {
        video.playbackRate = rate;
      },
    };

    // ✅ UI SHOW/HIDE
    function showUI() {
      overlay.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        overlay.classList.remove("show");
      }, 5000);
    }

    document.addEventListener("mousemove", showUI);
    video.addEventListener("mousemove", showUI);

    function togglePlay() {
      video.paused ? video.play() : video.pause();
    }

    player.onclick = (e: any) => {
      if (e.target.closest(".controls") || e.target.closest(".top-controls"))
        return;
      togglePlay();
      centerPlay.style.opacity = "1";
      centerPlay.textContent = video.paused ? "▶" : "❚❚";
      setTimeout(() => (centerPlay.style.opacity = "0"), 600);
    };

    playBtn.onclick = togglePlay;
    video.onplay = () => (playBtn.textContent = "❚❚");
    video.onpause = () => (playBtn.textContent = "▶");

    skipBack.onclick = () => (video.currentTime -= 10);
    skipForward.onclick = () => (video.currentTime += 10);

    volumeSlider.value = String(video.volume);
    volumeSlider.oninput = (e: any) => (video.volume = e.target.value);

    video.onvolumechange = () => {
      volumeBtn.textContent =
        video.muted || video.volume === 0
          ? "🔇"
          : video.volume < 0.5
            ? "🔉"
            : "🔊";
    };

    fsBtn.onclick = () =>
      document.fullscreenElement
        ? document.exitFullscreen()
        : player.requestFullscreen();

    showUI();

    return () => {
      document.removeEventListener("mousemove", showUI);
      if (hls) hls.destroy();
    };
  }, [movie_id]);
}
