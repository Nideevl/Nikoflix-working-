import express from "express";
import {
  adminLogin,
  createContentAdmin,
  updateContentAdmin,
  deleteContentAdmin,
  createEpisodeAdmin,
  updateEpisodeAdmin,
  deleteEpisodeAdmin,
  updateMovieAdmin
} from "./admin.controller.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// AUTH
router.post("/login", adminLogin);

// CONTENT (ADMIN)
router.post("/content", adminMiddleware, createContentAdmin);
router.put("/content/:contentId", adminMiddleware, updateContentAdmin);
router.delete("/content/:contentId", adminMiddleware, deleteContentAdmin);

// EPISODES (ADMIN)
router.post("/episodes", adminMiddleware, createEpisodeAdmin);
router.put("/episodes/:episodeId", adminMiddleware, updateEpisodeAdmin);
router.delete("/episodes/:episodeId", adminMiddleware, deleteEpisodeAdmin);

// MOVIES (ADMIN)
router.put("/movies/:movieId", adminMiddleware, updateMovieAdmin);

export default router;
