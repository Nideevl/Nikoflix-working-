import express from "express";
import { getMovieById } from "./movies.controller.js";

const router = express.Router();

router.get("/:movieId", getMovieById);

export default router;
