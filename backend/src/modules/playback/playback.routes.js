import express from "express";
import { playbackAccessMiddleware } from "../../middlewares/access.middleware.js";

const router = express.Router();

// Movie playback
router.get("/movie/:movieId",
  playbackAccessMiddleware,
  (req, res) => {
    res.json({
      message: "Movie playback allowed",
      movie_id: req.params.movieId
    });
  }
);

// Episode playback
router.get("/episode/:episodeId",
  playbackAccessMiddleware,
  (req, res) => {
    res.json({
      message: "Episode playback allowed",
      episode_id: req.params.episodeId
    });
  }
);

export default router;
