"use client";

import ProgressBar from "./ProgressBar";
import SettingsUI from "./SettingsUI";
import { MoveLeft, Maximize, Minimize, Volume2, Play, Pause } from "lucide-react";
import styles from "./settingsUI.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import SkipForward from "../../../public/icons/skipForward.ico";
import SkipBackward from "../../../public/icons/skipBack.ico";
import NotLiked from "../../../public/icons/notLiked.ico";
import CommentsOff from "../../../public/icons/commentsOff.ico";
import CommentsOn from "../../../public/icons/commentsOn.ico";
import CommentsPanel from "../comments/CommentsPanel";

export default function PlayerUI({ movie_id }: { movie_id?: string }) {
  const [uiVisible, setUiVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    (window as any).__SHOW_UI__ = setUiVisible;
  }, []);

  // 🎬 Sync React state with video state
  useEffect(() => {
    const video = document.getElementById("video") as HTMLVideoElement | null;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onReady = () => setIsReady(true);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
    };

  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);


  function togglePlay() {
    const video = document.getElementById("video") as HTMLVideoElement;
    if (!video || !isReady) return;

    if (video.paused) video.play();
    else video.pause();
  }

  return (
    <div className={styles.player} id="player">
      <video id="video" />

      {/* 🔥 LOADING SCREEN */}
      {!isReady && (
        <div className={styles.loadingScreen}>
          <div className={styles.loader}></div>
        </div>
      )}

      {/* OVERLAY */}
      <div
        className={`${styles.overlay} ${uiVisible ? styles.overlayVisible : styles.overlayHidden
          }`}
        style={{ pointerEvents: isReady ? "auto" : "none" }} // disable clicks when loading
        id="overlay"
      >
        {/* TOP BAR */}
        <div className={styles.topControls} data-player-ui>
          <div className={styles.backBtn} onClick={() => history.back()}>
            <MoveLeft />
          </div>
          <div className={styles.titleInfo} id="movieTitle">
            Title
          </div>
        </div>

        {/* CENTER CONTROLS */}
        <div className={styles.centerControls}>
          <div className={styles.centerPlay} id="centerPlay">
            ▶
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className={styles.bottomControls} data-player-ui>
          <div className={styles.upperHalf}>
            <ProgressBar />
          </div>

          <div className={styles.bottomHalf}>
            {/* LEFT */}
            <div className={styles.bottomStartButtons}>
              <button className={styles.btn} id="play" onClick={togglePlay} disabled={!isReady}>
                {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
              </button>

              <Image className={styles.centerBtn} src={SkipBackward} id="skipBack" alt="back" width={24} height={24} />
              <Image className={styles.centerBtn} src={SkipForward} id="skipForward" alt="forward" width={24} height={24} />

              <div className={styles.volumeContainer}>
                <button className={styles.btn} id="volumeBtn">
                  <span id="volumeIcon"><Volume2 fill="white" size={24} /></span>
                </button>
                <input
                  type="range"
                  className={styles.volumeSlider}
                  id="volumeSlider"
                  min="0"
                  max="1"
                  step="0.05"
                  defaultValue="1"
                />
              </div>

              <div className={styles.bottomMiddleButtons}>
                <button className={styles.btn} id="likeBtn">
                  <span id="likeIcon">
                    <Image className={styles.centerBtn} src={NotLiked} alt="like" width={23} height={23} /></span>
                  <span id="likeCount">0</span>
                </button>

                <button
                  className={styles.btn}
                  id="commentBtn"
                  data-player-ui
                  onClick={(e) => {
                    e.stopPropagation();
                    setCommentsOpen(prev => !prev);
                  }}
                >
                  <span id="commentIcon" data-player-ui>
                    <Image
                      className={styles.centerBtn}
                      src={commentsOpen ? CommentsOn : CommentsOff}
                      alt="comments"
                      width={23}
                      height={23}
                    />
                  </span>

                  <span id="commentCount">0</span>
                </button>

              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.bottomEndButtons}>
              <div>
                <SettingsUI />
              </div>

              <button
                className={styles.btn}
                id="fs"
                onClick={() => {
                  const player = document.getElementById("player") as HTMLDivElement;
                  if (!player) return;

                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    player.requestFullscreen();
                  }
                }}
              >
                {isFullscreen ? <Minimize /> : <Maximize />}
              </button>

            </div>
          </div>
        </div>
      </div>

      {commentsOpen &&
        <CommentsPanel
          movieId={movie_id}
          open={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      }

    </div>
  );
}
