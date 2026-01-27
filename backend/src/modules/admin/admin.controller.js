import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query } from "../../config/db.js";
import { sendOtpEmailToAdmin } from "../../utils/sendOtpEmail.js";
import { generateAdminJwt } from "../../utils/jwt.js";

import * as adminService from "./admin.services.js";

/* =======================
   AUTH
======================= */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query(
    "SELECT * FROM admins WHERE email=$1",
    [email]
  );

  if (rows.length === 0)
    return res.status(401).json({ error: "Admin not found" });

  const admin = rows[0];

  const valid = await bcrypt.compare(password, admin.password_hash);

  if (!valid)
    return res.status(401).json({ error: "Invalid password" });

  const token = generateAdminJwt(admin.admin_id);

  res.json({ token });
};

export const requestAdminSignup = async (req, res) => {
  const { email } = req.body;

  // Check if already exists
  const { rows } = await query(
    "SELECT * FROM admins WHERE email=$1",
    [email]
  );

  if (rows.length > 0)
    return res.status(400).json({ error: "Admin already exists" });

  const otpUser = Math.floor(100000 + Math.random() * 900000).toString();
  const otpMainAdmin = Math.floor(100000 + Math.random() * 900000).toString();

  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await query(
    "INSERT INTO admin_otps (email, otp, purpose, expires_at) VALUES ($1,$2,$3,$4)",
    [email, otpUser, "signup", expires]
  );

  await query(
    "INSERT INTO admin_otps (email, otp, purpose, expires_at) VALUES ($1,$2,$3,$4)",
    [email, otpMainAdmin, "dual_admin", expires]
  );

  await sendOtpEmail(email, otpUser, "signup");
  await sendOtpEmail("nideevl4574@gmail.com", otpMainAdmin, "dual_admin");

  res.json({ message: "Both OTPs sent" });
};

export const verifyAdminSignup = async (req, res) => {
  const { email, otpUser, otpAdmin, password } = req.body;

  const { rows } = await query(
    `SELECT * FROM admin_otps 
     WHERE email=$1 AND expires_at > NOW()`,
    [email]
  );

  const userOtpValid = rows.find(r => r.otp === otpUser && r.purpose === "signup");
  const adminOtpValid = rows.find(r => r.otp === otpAdmin && r.purpose === "dual_admin");

  if (!userOtpValid || !adminOtpValid)
    return res.status(400).json({ error: "Invalid OTPs" });

  const hash = await bcrypt.hash(password, 12);

  await query(
    "INSERT INTO admins (email, password_hash) VALUES ($1,$2)",
    [email, hash]
  );

  res.json({ message: "Admin created successfully" });
};

export const requestAdminResetOtp = async (req, res) => {
  const { email } = req.body;

  const { rows } = await query(
    "SELECT * FROM admins WHERE email=$1",
    [email]
  );

  if (rows.length === 0)
    return res.status(404).json({ error: "Admin not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await query(
    "INSERT INTO admin_otps (email, otp, purpose, expires_at) VALUES ($1,$2,$3,$4)",
    [email, otp, "reset", expires]
  );

  await sendOtpEmailToAdmin(email, otp, "reset");

  res.json({ message: "OTP sent" });
};

export const resetAdminPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const { rows } = await query(
    `SELECT * FROM admin_otps 
     WHERE email=$1 AND otp=$2 AND purpose='reset' AND expires_at > NOW()`,
    [email, otp]
  );

  if (rows.length === 0)
    return res.status(400).json({ error: "Invalid OTP" });

  const hash = await bcrypt.hash(newPassword, 12);

  await query(
    "UPDATE admins SET password_hash=$1 WHERE email=$2",
    [hash, email]
  );

  res.json({ message: "Password updated" });
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
    return res.status(404).json({ error: "Content njot found" });
  }

  res.json(content);
};

export const deleteContentAdmin = async (req, res) => {
  const { contentId } = req.params;

  const deleted = await adminService.deleteContent(contentId);

  if (!deleted) {
    return res.status(404).json({ error: "Contjent not found" });
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
    return res.status(404).json({ error: "Movie not fgound" });
  }

  res.json(movie);
};
