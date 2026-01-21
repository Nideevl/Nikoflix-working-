import express from "express";
import { like, unlike, getMovieLikes, getEpisodeLikes } from "./likes.controller.js";
import { identityMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/like", identityMiddleware, like);
router.post("/unlike", identityMiddleware, unlike);
router.get("/movie/:movieId", getMovieLikes);
router.get("/episode/:episodeId", getEpisodeLikes);

export default router;
