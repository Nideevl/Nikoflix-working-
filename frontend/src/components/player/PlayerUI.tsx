import ProgressBar from "./ProgressBar";
import SettingsUI from "./SettingsUI";

export default function PlayerUI() {
  return (
    <>
      <div className="player" id="player">
        <video id="video" />

        <div className="center-play" id="centerPlay">▶</div>

        <div className="overlay" id="overlay">
          <div className="top-controls">
            <div className="back-btn" onClick={() => history.back()}>←</div>
            <div className="title-info" id="movieTitle">Loading…</div>
          </div>

          <ProgressBar />

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

            <button className="btn" id="likeBtn">
              👍 <span id="likeCount"></span>
            </button>

            <button className="btn" id="commentBtn">
              💬 <span id="commentCount"></span>
            </button>

            <div className="spacer"></div>

            {/* ✅ SETTINGS UI REPLACES quality/audio/subs buttons */}
            <SettingsUI />

            <button className="btn" id="fs">⛶</button>
          </div>
        </div>

        <div id="commentsPanel">
          <button id="closeComments">Close</button>
          <div id="commentsList"></div>
        </div>
      </div>
    </>
  );
}
