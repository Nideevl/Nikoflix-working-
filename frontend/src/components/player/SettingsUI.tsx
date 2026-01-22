"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./settingsUI.module.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

type View = "main" | "quality" | "audio" | "subs" | "speed";

const PRESET_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function SettingsUI() {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>("main");
    const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");

    const [qualities, setQualities] = useState<any[]>([]);
    const [audios, setAudios] = useState<any[]>([]);
    const [subs, setSubs] = useState<any[]>([]);

    const [currentQuality, setCurrentQuality] = useState(-1);
    const [currentAudio, setCurrentAudio] = useState(0);
    const [currentSub, setCurrentSub] = useState(-1);

    const [presetSpeed, setPresetSpeed] = useState<number | null>(1); // selected preset
    const [customSpeed, setCustomSpeed] = useState(1); // slider value
    const sliderRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!open) return;
        if (view !== "speed") return;

        if (sliderRef.current) {
            updateSliderStyle(sliderRef.current);
        }
    }, [open, view, customSpeed, presetSpeed]);

    function getPlayer() {
        return (window as any).__PLAYER_STATE__;
    }

    function updateSliderStyle(el: HTMLInputElement) {
        const min = parseFloat(el.min);
        const max = parseFloat(el.max);
        const val = parseFloat(el.value);
        const percent = ((val - min) / (max - min)) * 100;

        el.style.background = `
      linear-gradient(
        to right,
        #e50914 0%,
        #e50914 ${percent}%,
        rgba(255,255,255,0.15) ${percent}%,
        rgba(255,255,255,0.15) 100%
      )
    `;
    }

    function setPlaybackSpeed(speed: number, fromPreset: boolean) {
        const { video } = getPlayer();
        video.playbackRate = speed;

        if (fromPreset) {
            setPresetSpeed(speed);
        } else {
            setPresetSpeed(null); // custom mode active
            setCustomSpeed(speed);
        }
    }

    useEffect(() => {
        if (!open) return;

        const state = getPlayer();
        if (!state) return;

        const { hls, video } = state;

        if (hls) {
            setQualities([...hls.levels]);
            setAudios([...hls.audioTracks]);
            setSubs([...hls.subtitleTracks]);
            setCurrentQuality(hls.currentLevel);
            setCurrentAudio(hls.audioTrack);
            setCurrentSub(hls.subtitleTrack);
        }

        if (video) {
            const speed = video.playbackRate;
            setCustomSpeed(speed);

            if (PRESET_SPEEDS.includes(speed)) {
                setPresetSpeed(speed);
            } else {
                setPresetSpeed(null);
            }
        }
    }, [open]);

    useEffect(() => {
        if (sliderRef.current) updateSliderStyle(sliderRef.current);
    }, [customSpeed]);

    function setQuality(i: number) {
        const { hls } = getPlayer();
        hls.currentLevel = i;
        setCurrentQuality(i);
    }

    function setAudio(i: number) {
        const { hls } = getPlayer();
        hls.audioTrack = i;
        setCurrentAudio(i);
    }

    function setSub(i: number) {
        const { hls } = getPlayer();
        hls.subtitleTrack = i;
        setCurrentSub(i);
    }

    const getWidthClass = () => {
        if (view === "main") return styles.settingsMain;
        if (view === "speed") return styles.settingsWide;
        return styles.settingsNarrow;
    };

    const VIEW_TITLE: Record<View, string> = {
        main: "",
        quality: "Quality",
        audio: "Audio",
        subs: "Subtitles",
        speed: "Playback speed",
    };

    return (
        <>
            <button className={`${styles.button} ${inter.className}`} onClick={() => setOpen(!open)}>
                ⚙️
            </button>

            {open && (
                <div className={`${styles.settings} ${getWidthClass()} ${inter.className}`}>
                    {view !== "main" && (
                        <div
                            className={styles.back}
                            onClick={() => {
                                setSlideDirection("back");
                                setView("main");
                            }}
                        >
                            {VIEW_TITLE[view]}
                        </div>
                    )}

                    <div
                        key={view}
                        className={`${styles.content} ${slideDirection === "forward" ? styles.contentForward : styles.contentBack
                            }`}
                    >
                        {/* MAIN */}
                        {view === "main" && (
                            <>
                                <div className={styles.row} onClick={() => { setSlideDirection("forward"); setView("quality"); }}>
                                    <span>Quality</span>
                                    <span className={styles.value}>
                                        {currentQuality === -1 ? "Auto" : qualities[currentQuality]?.height + "p"}
                                    </span>
                                </div>

                                <div className={styles.row} onClick={() => { setSlideDirection("forward"); setView("audio"); }}>
                                    <span>Audio</span>
                                    <span className={styles.value}>
                                        {audios[currentAudio]?.name || audios[currentAudio]?.lang || "Track"}
                                    </span>
                                </div>

                                <div className={styles.row} onClick={() => { setSlideDirection("forward"); setView("subs"); }}>
                                    <span>Subtitles</span>
                                    <span className={styles.value}>
                                        {currentSub === -1 ? "Off" : subs[currentSub]?.name || subs[currentSub]?.lang}
                                    </span>
                                </div>

                                <div className={styles.row} onClick={() => { setSlideDirection("forward"); setView("speed"); }}>
                                    <span>Playback speed</span>
                                    <span className={styles.value}>
                                        {(presetSpeed ?? customSpeed).toFixed(2)}x
                                    </span>
                                </div>
                            </>
                        )}

                        {/* QUALITY */}
                        {view === "quality" && (
                            <div className={styles.itemsContainer}>
                                <div className={styles.item} onClick={() => setQuality(-1)}>
                                    Auto {currentQuality === -1 && <span className={styles.check}>✓</span>}
                                </div>
                                {qualities.map((q, i) => (
                                    <div key={i} className={styles.item} onClick={() => setQuality(i)}>
                                        {q.height}p {currentQuality === i && <span className={styles.check}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* AUDIO */}
                        {view === "audio" && (
                            <div className={styles.itemsContainer}>
                                {audios.map((a, i) => (
                                    <div key={i} className={styles.item} onClick={() => setAudio(i)}>
                                        {a.name || a.lang || `Track ${i + 1}`}
                                        {currentAudio === i && <span className={styles.check}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SUBTITLES */}
                        {view === "subs" && (
                            <div className={styles.itemsContainer}>
                                <div className={styles.item} onClick={() => setSub(-1)}>
                                    Off {currentSub === -1 && <span className={styles.check}>✓</span>}
                                </div>
                                {subs.map((s, i) => (
                                    <div key={i} className={styles.item} onClick={() => setSub(i)}>
                                        {s.name || s.lang}
                                        {currentSub === i && <span className={styles.check}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SPEED */}
                        {view === "speed" && (
                            <div className={styles.speedWrapper}>
                                <div className={`${styles.customRow} ${presetSpeed === null ? styles.active : ""}`}>
                                    <span className={styles.customLabel}>Custom</span>

                                    <input
                                        ref={sliderRef}
                                        type="range"
                                        min="0.25"
                                        max="2"
                                        step="0.05"
                                        value={customSpeed}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value);
                                            setCustomSpeed(v);
                                            setPlaybackSpeed(v, false);
                                        }}
                                        className={styles.slider}
                                    />


                                    <span className={styles.speedValue}>{customSpeed.toFixed(2)}x</span>
                                </div>

                                <div className={styles.speedGrid}>
                                    {PRESET_SPEEDS.map((s) => (
                                        <div
                                            key={s}
                                            className={`${styles.speed} ${presetSpeed === s ? styles.active : ""}`}
                                            onClick={() => setPlaybackSpeed(s, true)}
                                        >
                                            {s}x
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
