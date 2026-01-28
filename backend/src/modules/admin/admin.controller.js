import bcrypt from "bcrypt";
import { query } from "../../config/db.js";
import { sendOtpEmailToAdmin } from "../../utils/sendOtpEmail.js";
import { generateAdminJwt } from "../../utils/jwt.js";
import {
  searchMoviesService,
  updateMovieService,
  bulkCreateMoviesService,
  deleteMovieService,
  
  searchSeriesService,
  bulkCreateSeriesService,
  updateSeriesService,
  deleteSeriesService,

  getEpisodesBySeriesService,
  bulkCreateEpisodesService,
  bulkUpdateEpisodesService,
  deleteEpisodeService,
} from "./admin.services.js";

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
  
  await sendOtpEmailToAdmin(email, otpUser, "signup");
  await sendOtpEmailToAdmin("nideevl4574@gmail.com", otpMainAdmin, "dual_admin");
  
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
export const getAllGenres = async (req, res) => {
  const { rows } = await query("SELECT * FROM genres ORDER BY name");
  res.json(rows);
};
export const getContentGenres = async (req, res) => {
  const { contentId } = req.params;

  const { rows } = await pool.query(
    `
    SELECT g.genre_id, g.name
    FROM content_genres cg
    JOIN genres g ON g.genre_id = cg.genre_id
    WHERE cg.content_id = $1
    `,
    [contentId]
  );

  res.json(rows);
};

// 🎬 MOVIES
// 1️⃣ Get all genres

export async function searchMovies(req, res) {
  try {
    const q = req.query.q || "";
    const movies = await searchMoviesService(q);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateMovie(req, res) {
  try {
    await updateMovieService(req.params.contentId, req.body);
    res.json({ message: "Movie updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bulkCreateMovies(req, res) {
  try {
    const ids = await bulkCreateMoviesService(req.body.movies);
    res.json({ message: "Movies created", ids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteMovie(req, res) {
  try {
    await deleteMovieService(req.params.contentId);
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



// 📺 SERIES

export async function searchSeries(req, res) {
  try {
    const q = req.query.q || "";
    const series = await searchSeriesService(q);
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bulkCreateSeries(req, res) {
  try {
    const ids = await bulkCreateSeriesService(req.body.series);
    res.json({ message: "Series created", ids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSeries(req, res) {
  try {
    await updateSeriesService(req.params.contentId, req.body);
    res.json({ message: "Series updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteSeries(req, res) {
  try {
    await deleteSeriesService(req.params.contentId);
    res.json({ message: "Series deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// 🎬 EPISODES

export async function getEpisodesBySeries(req, res) {
  try {
    const episodes = await getEpisodesBySeriesService(req.params.contentId);
    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bulkCreateEpisodes(req, res) {
  try {
    await bulkCreateEpisodesService(req.body.content_id, req.body.episodes);
    res.json({ message: "Episodes created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bulkUpdateEpisodes(req, res) {
  try {
    await bulkUpdateEpisodesService(req.body.episodes);
    res.json({ message: "Episodes updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteEpisode(req, res) {
  try {
    await deleteEpisodeService(req.params.episodeId);
    res.json({ message: "Episode deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}