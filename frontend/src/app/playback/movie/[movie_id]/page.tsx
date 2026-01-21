"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Hls from "hls.js";

export default function Page() {
  const { movie_id } = useParams<{ movie_id: string }>();

  useEffect(() => {
    if (!movie_id) return;

    /* ================= DOM ================= */
    const video = document.getElementById("video") as HTMLVideoElement;
    const player = document.getElementById("player") as HTMLDivElement;
    const overlay = document.getElementById("overlay") as HTMLDivElement;
    const centerPlay = document.getElementById("centerPlay") as HTMLDivElement;

    const titleEl = document.getElementById("movieTitle") as HTMLDivElement;

    const playBtn = document.getElementById("play") as HTMLButtonElement;
    const skipBack = document.getElementById("skipBack") as HTMLButtonElement;
    const skipForward = document.getElementById("skipForward") as HTMLButtonElement;
    const volumeBtn = document.getElementById("volumeBtn") as HTMLButtonElement;
    const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
    const timeEl = document.getElementById("time") as HTMLSpanElement;

    const progress = document.getElementById("progress") as HTMLDivElement;
    const filled = document.getElementById("progressFilled") as HTMLDivElement;
    const thumb = document.getElementById("progressThumb") as HTMLDivElement;

    const qualityBtn = document.getElementById("qualityBtn") as HTMLButtonElement;
    const audioBtn = document.getElementById("audioBtn") as HTMLButtonElement;
    const subsBtn = document.getElementById("subsBtn") as HTMLButtonElement;

    const qualityPopup = document.getElementById("qualityPopup") as HTMLDivElement;
    const audioPopup = document.getElementById("audioPopup") as HTMLDivElement;
    const subsPopup = document.getElementById("subsPopup") as HTMLDivElement;

    const fsBtn = document.getElementById("fs") as HTMLButtonElement;

    const likeBtn = document.getElementById("likeBtn") as HTMLButtonElement;
    const likeCount = document.getElementById("likeCount") as HTMLSpanElement;

    const commentBtn = document.getElementById("commentBtn") as HTMLButtonElement;
    const commentCount = document.getElementById("commentCount") as HTMLSpanElement;

    const commentsPanel = document.getElementById("commentsPanel") as HTMLDivElement;
    const closeComments = document.getElementById("closeComments") as HTMLButtonElement;
    const commentsList = document.getElementById("commentsList") as HTMLDivElement;

    commentsPanel.style.display = "none";

    let movieLikeCount = 0;
    let movieCommentCount = 0;

    let hasLikedMovie = false; // ⭐ toggle state

    let hls: Hls;
    let hideTimer: any;
    let popupOpen: HTMLElement | null = null;

    /* ================= MOVIE META ================= */
    async function loadMovieMeta() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/movies/${movie_id}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const movie = await res.json();
      titleEl.textContent = movie.title;
    }

    /* ================= INITIAL COUNTS ================= */
    async function loadInitialCounts() {
      const [likesRes, commentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/likes/movie/${movie_id}`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/comments/movie/${movie_id}`, {
          credentials: "include",
        }),
      ]);

      if (likesRes.ok) {
        const data = await likesRes.json();
        movieLikeCount = data.count;
        hasLikedMovie = data.liked; // ⭐ backend-driven truth
        console.log(hasLikedMovie," ours");
        likeCount.textContent = String(movieLikeCount);
      }

      if (commentsRes.ok) {
        const comments = await commentsRes.json();
        movieCommentCount = comments.length;
        commentCount.textContent = String(movieCommentCount);
      }
    }

    /* ================= LIKE TOGGLE ================= */
    likeBtn.onclick = async () => {
      if (hasLikedMovie) {
        // UNLIKE
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/likes/unlike`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: movie_id }),
        });

        hasLikedMovie = false;
        movieLikeCount -= 1;
      } else {
        // LIKE
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/likes/like`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: movie_id }),
        });

        hasLikedMovie = true;
        movieLikeCount += 1;
      }

      likeCount.textContent = String(movieLikeCount);
    };

    /* ================= COMMENTS ================= */
    async function loadComments() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/comments/movie/${movie_id}`,
        { credentials: "include" }
      );
      if (!res.ok) return;

      const comments = await res.json();
      commentsList.innerHTML = "";

      comments.forEach((c: any) => {
        const div = document.createElement("div");
        div.textContent = `${c.username ?? "Guest"}: ${c.comment}`;
        commentsList.appendChild(div);
      });
    }

    commentBtn.onclick = () => {
      commentsPanel.style.display = "block";
      loadComments();
    };

    closeComments.onclick = () => {
      commentsPanel.style.display = "none";
    };

    /* ================= PLAYER (UNCHANGED) ================= */
    const source = `https://nikoflix.b-cdn.net/movie/${movie_id}/master.m3u8`;

    function forceSubtitleDisplay() {
      if (hls && hls.subtitleTrack > -1) {
        const track = video.textTracks[hls.subtitleTrack];
        if (track) track.mode = "showing";
      }
    }

    if (Hls.isSupported()) {
      hls = new Hls({ enableWebVTT: true, renderTextTracksNatively: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.subtitleDisplay = true;

      hls.on(Hls.Events.MANIFEST_PARSED, setupQuality);
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, setupAudio);
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, setupSubs);
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () =>
        setTimeout(forceSubtitleDisplay, 100)
      );
    }

    function showUI() {
      overlay.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!popupOpen) overlay.classList.remove("show");
      }, 5000);
    }

    document.addEventListener("mousemove", showUI);
    video.addEventListener("mousemove", showUI);

    function togglePlay() {
      video.paused ? video.play() : video.pause();
    }

    player.onclick = (e: any) => {
      if (
        e.target.closest(".controls") ||
        e.target.closest(".popup") ||
        e.target.closest(".top-controls")
      )
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

    function updateProgress() {
      if (isNaN(video.duration)) return;
      const pct = (video.currentTime / video.duration) * 100;
      filled.style.width = pct + "%";
      thumb.style.left = pct + "%";

      const cm = Math.floor(video.currentTime / 60);
      const cs = String(Math.floor(video.currentTime % 60)).padStart(2, "0");
      const tm = Math.floor(video.duration / 60);
      const ts = String(Math.floor(video.duration % 60)).padStart(2, "0");
      timeEl.textContent = `${cm}:${cs} / ${tm}:${ts}`;
    }

    video.ontimeupdate = updateProgress;
    video.ondurationchange = updateProgress;

    progress.onclick = (e: any) => {
      const rect = progress.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      video.currentTime = pct * video.duration;
    };

    fsBtn.onclick = () =>
      document.fullscreenElement
        ? document.exitFullscreen()
        : player.requestFullscreen();

    function closePopups() {
      qualityPopup.classList.remove("show");
      audioPopup.classList.remove("show");
      subsPopup.classList.remove("show");
      popupOpen = null;
    }

    function togglePopup(popup: HTMLElement, btn: HTMLElement) {
      const isOpen = popup.classList.contains("show");
      closePopups();
      if (!isOpen) {
        popup.classList.add("show");
        const r = btn.getBoundingClientRect();
        popup.style.right = `${document.body.clientWidth - r.right}px`;
        popupOpen = popup;
      }
      showUI();
    }

    qualityBtn.onclick = (e) => {
      e.stopPropagation();
      togglePopup(qualityPopup, qualityBtn);
    };
    audioBtn.onclick = (e) => {
      e.stopPropagation();
      togglePopup(audioPopup, audioBtn);
    };
    subsBtn.onclick = (e) => {
      e.stopPropagation();
      togglePopup(subsPopup, subsBtn);
    };

    function setupQuality() {
      qualityPopup.innerHTML = "";
      const auto = document.createElement("button");
      auto.textContent = "Auto";
      auto.classList.toggle("active", hls.currentLevel === -1);
      auto.onclick = () => {
        hls.currentLevel = -1;
        setupQuality();
        closePopups();
      };
      qualityPopup.appendChild(auto);

      hls.levels.forEach((l, i) => {
        const b = document.createElement("button");
        b.textContent = `${l.height}p`;
        b.classList.toggle("active", hls.currentLevel === i);
        b.onclick = () => {
          hls.currentLevel = i;
          setupQuality();
          closePopups();
        };
        qualityPopup.appendChild(b);
      });
    }

    function setupAudio() {
      audioPopup.innerHTML = "";
      hls.audioTracks.forEach((t, i) => {
        const b = document.createElement("button");
        b.textContent = t.name || t.lang || `Track ${i + 1}`;
        b.classList.toggle("active", hls.audioTrack === i);
        b.onclick = () => {
          hls.audioTrack = i;
          setupAudio();
          closePopups();
        };
        audioPopup.appendChild(b);
      });
    }

    function setupSubs() {
      subsPopup.innerHTML = "";
      const off = document.createElement("button");
      off.textContent = "Off";
      off.onclick = () => {
        hls.subtitleTrack = -1;
        setupSubs();
        closePopups();
      };
      subsPopup.appendChild(off);

      hls.subtitleTracks.forEach((t, i) => {
        const b = document.createElement("button");
        b.textContent = t.name || t.lang;
        b.onclick = () => {
          hls.subtitleTrack = i;
          forceSubtitleDisplay();
          setupSubs();
          closePopups();
        };
        subsPopup.appendChild(b);
      });
    }

    loadMovieMeta();
    loadInitialCounts();
    showUI();
  }, [movie_id]);

  return (
    <>
      <style>{`/* YOUR FULL CSS GOES HERE — UNCHANGED */`}</style>

      <div className="player" id="player">
        <video id="video" />

        <div className="center-play" id="centerPlay">▶</div>

        <div className="overlay" id="overlay">
          <div className="top-controls">
            <div className="back-btn" onClick={() => history.back()}>←</div>
            <div className="title-info" id="movieTitle">Loading…</div>
          </div>

          <div className="progress-container">
            <div className="progress" id="progress">
              <div className="progress-filled" id="progressFilled"></div>
              <div className="progress-thumb" id="progressThumb"></div>
            </div>
          </div>

          <div className="controls">
            <button className="btn" id="play">▶</button>
            <button className="btn" id="skipBack">⟪</button>
            <button className="btn" id="skipForward">⟫</button>

            <div className="volume-container">
              <button className="btn" id="volumeBtn">🔊</button>
              <input
                type="range"
                className="volume-slider"
                id="volumeSlider"
                min="0"
                max="1"
                step="0.05"
                defaultValue="1"
              />
            </div>

            <span className="time-display" id="time">0:00 / 0:00</span>

            <button className="btn" id="likeBtn">
              👍 <span id="likeCount"></span>
            </button>

            <button className="btn" id="commentBtn">
              💬 <span id="commentCount"></span>
            </button>

            <div className="spacer"></div>

            <button className="btn" id="subsBtn">Subtitles</button>
            <button className="btn" id="audioBtn">Audio</button>
            <button className="btn" id="qualityBtn">Quality</button>
            <button className="btn" id="fs">⛶</button>
          </div>

          <div className="popup" id="qualityPopup"></div>
          <div className="popup" id="audioPopup"></div>
          <div className="popup" id="subsPopup"></div>
        </div>

        <div id="commentsPanel">
          <button id="closeComments">Close</button>
          <div id="commentsList"></div>
        </div>
      </div>
    </>
  );
}
