import express from "express";
import {
  createMovieComment,
  createEpisodeComment,
  getCommentsByMovie,
  getCommentsByEpisode,
  deleteComment
} from "./comments.controller.js";

const router = express.Router();

// Create comment (USER ONLY – enforced in controller)
router.post("/movie/:movieId", createMovieComment);
router.post("/episode/:episodeId", createEpisodeComment);

// Read comments
router.get("/movie/:movieId", getCommentsByMovie);
router.get("/episode/:episodeId", getCommentsByEpisode);

// Delete comment (owner only)
router.delete("/:commentId", deleteComment);

export default router;
