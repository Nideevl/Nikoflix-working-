import express from "express";
import { getEpisodeById } from "./episodes.controller.js";

const router = express.Router();

router.get("/:episodeId", getEpisodeById);

export default router;
