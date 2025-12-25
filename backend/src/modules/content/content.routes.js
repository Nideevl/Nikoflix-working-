import express from "express";
import {
  getAllContent,
  getContentById,
  getEpisodesBySeries
} from "./content.controller.js";

const router = express.Router();

router.get("/", getAllContent);
router.get("/:contentId", getContentById);
router.get("/:contentId/episodes", getEpisodesBySeries);

export default router;
