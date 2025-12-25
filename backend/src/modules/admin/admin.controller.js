import jwt from "jsonwebtoken";
import * as adminService from "./admin.services.js";

/* =======================
   AUTH
======================= */
export const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
};

/* =======================
   CONTENT
======================= */
export const createContentAdmin = async (req, res) => {
  const { title, type, is_premium = false } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: "title and type are required" });
  }

  const content = await adminService.createContent(
    title,
    type,
    is_premium
  );

  res.status(201).json(content);
};

export const updateContentAdmin = async (req, res) => {
  const { contentId } = req.params;
  const { title, is_premium } = req.body;

  const content = await adminService.updateContent(
    contentId,
    title,
    is_premium
  );

  if (!content) {
    return res.status(404).json({ error: "Content not found" });
  }

  res.json(content);
};

export const deleteContentAdmin = async (req, res) => {
  const { contentId } = req.params;

  const deleted = await adminService.deleteContent(contentId);

  if (!deleted) {
    return res.status(404).json({ error: "Content not found" });
  }

  res.status(204).send();
};

/* =======================
   EPISODES
======================= */
export const createEpisodeAdmin = async (req, res) => {
  const {
    content_id,
    episode_number,
    title,
    duration,
    video_url
  } = req.body;

  if (!content_id || !episode_number || !title || !video_url) {
    return res.status(400).json({
      error: "content_id, episode_number, title, video_url are required"
    });
  }

  const episode = await adminService.createEpisode(
    content_id,
    episode_number,
    title,
    duration,
    video_url
  );

  res.status(201).json(episode);
};

export const updateEpisodeAdmin = async (req, res) => {
  const { episodeId } = req.params;
  const { episode_number, title, duration, video_url } = req.body;

  const episode = await adminService.updateEpisode(
    episodeId,
    episode_number,
    title,
    duration,
    video_url
  );

  if (!episode) {
    return res.status(404).json({ error: "Episode not found" });
  }

  res.json(episode);
};

export const deleteEpisodeAdmin = async (req, res) => {
  const { episodeId } = req.params;

  const deleted = await adminService.deleteEpisode(episodeId);

  if (!deleted) {
    return res.status(404).json({ error: "Episode not found" });
  }

  res.status(204).send();
};

/* =======================
   MOVIES
======================= */
export const updateMovieAdmin = async (req, res) => {
  const { movieId } = req.params;
  const { duration, video_url } = req.body;

  if (!duration && !video_url) {
    return res.status(400).json({
      error: "At least one of duration or video_url must be provided"
    });
  }

  const movie = await adminService.updateMovie(
    movieId,
    duration,
    video_url
  );

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(movie);
};
