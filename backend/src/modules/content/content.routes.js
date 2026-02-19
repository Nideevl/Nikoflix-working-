import express from "express";
import {
  getAllContent,
  getContentById,
  getEpisodesBySeries,
  getContentRow,
  getContentCollection,
  getSimilarContent,
  getSearch,
  getReadyContent  // 👈 add this
} from "./content.controller.js";

const router = express.Router();

router.get("/", getAllContent);
router.get("/row", getContentRow);
router.get("/collection/:contentId", getContentCollection);
router.get("/similar/:contentId", getSimilarContent);
router.get("/search", getSearch);
router.get("/ready", getReadyContent);
router.get("/:contentId", getContentById);
router.get("/:contentId/episodes", getEpisodesBySeries);

export default router;
