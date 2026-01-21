import express from "express";
import {
  createMovieComment,
  createEpisodeComment,
  getCommentsByMovie,
  getCommentsByEpisode,
  deleteComment,
  likeComment,
  unlikeComment
} from "./comments.controller.js";

const router = express.Router();

// CREATE (USER ONLY – enforced in controller)
router.post("/movie/:movieId", createMovieComment);
router.post("/episode/:episodeId", createEpisodeComment);

// READ (PUBLIC)
router.get("/movie/:movieId", getCommentsByMovie);
router.get("/episode/:episodeId", getCommentsByEpisode);

// DELETE (USER ONLY)
router.delete("/:commentId", deleteComment);

router.post("/:commentId/like", likeComment);
router.post("/:commentId/unlike", unlikeComment);


export default router;
