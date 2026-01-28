import express from "express";
import {
  adminLogin,
  requestAdminSignup,
  verifyAdminSignup,
  requestAdminResetOtp,
  resetAdminPassword,
  searchMovies,
  updateMovie,
  bulkCreateMovies,
  searchSeries,
  bulkCreateSeries,
  updateSeries,
  getEpisodesBySeries,
  bulkCreateEpisodes,
  bulkUpdateEpisodes,
  deleteMovie,
  deleteSeries,
  deleteEpisode,
  getAllGenres,
  getContentGenres
} from "./admin.controller.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// AUTH
router.post("/login", adminLogin);

// SIGNUP FLOW
router.post("/signup/request", requestAdminSignup);
router.post("/signup/verify", verifyAdminSignup);

// RESET FLOW
router.post("/reset/request", requestAdminResetOtp);
router.post("/reset/verify", resetAdminPassword);

router.get("/genres", getAllGenres);
router.get("/content/:contentId/genres", getContentGenres);

// 🎬 MOVIES
router.get("/movies/search", adminMiddleware, searchMovies);
router.post("/movies/bulk", adminMiddleware, bulkCreateMovies);
router.put("/movies/:contentId", adminMiddleware, updateMovie);
router.delete("/movie/:contentId", adminMiddleware, deleteMovie);

// 📺 SERIES
router.get("/series/search", adminMiddleware, searchSeries);
router.post("/series/bulk", adminMiddleware, bulkCreateSeries);
router.put("/series/:contentId", adminMiddleware, updateSeries);
router.delete("/serie/:contentId", adminMiddleware, deleteSeries);

// 🎬 EPISODES
router.get("/episodes/:contentId", adminMiddleware, getEpisodesBySeries);
router.post("/episodes/bulk", adminMiddleware, bulkCreateEpisodes);
router.put("/episodes/update-bulk", adminMiddleware, bulkUpdateEpisodes);
router.delete("/episode/:contentId", adminMiddleware, deleteEpisode);

export default router;
