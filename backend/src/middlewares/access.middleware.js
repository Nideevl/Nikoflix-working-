import { query } from "../config/db.js";

/**
 * Enforces playback access for movies & episodes
 * Subscription OR direct purchase model
 */
export const playbackAccessMiddleware = async (req, res, next) => {
  const { movieId, episodeId } = req.params;

  let contentId;

  /* =========================
     RESOLVE PLAYABLE → CONTENT
  ========================== */
  if (movieId) {
    const { rows } = await query(
      `
      SELECT content_id
      FROM movies
      WHERE movie_id = $1
      `,
      [movieId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    contentId = rows[0].content_id;
  }

  if (episodeId) {
    const { rows } = await query(
      `
      SELECT content_id
      FROM episodes
      WHERE episode_id = $1
      `,
      [episodeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Episode not found" });
    }

    contentId = rows[0].content_id;
  }

  /* =========================
     FETCH CONTENT
  ========================== */
  const { rows: contentRows } = await query(
    `
    SELECT is_premium
    FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  if (contentRows.length === 0) {
    return res.status(404).json({ error: "Content not found" });
  }

  const { is_premium } = contentRows[0];

  /* =========================
     FREE CONTENT
  ========================== */
  if (!is_premium) {
    req.contentId = contentId;
    return next();
  }

  /* =========================
     PREMIUM CONTENT
  ========================== */
  if (req.identity.type !== "user") {
    return res.status(403).json({
      error: "Login required to access premium content"
    });
  }

  const userId = req.identity.user_id;

  /* ---- 1️⃣ Subscription check ---- */
  const { rows: subscriptionRows } = await query(
    `
      SELECT 1
      FROM subscriptions
      WHERE user_id = $1
        AND is_active = true
        AND end_date > NOW();
    `,
    [userId]
  );

  if (subscriptionRows.length > 0) {
    req.contentId = contentId;
    return next(); // ✅ subscription grants access
  }

  /* ---- 2️⃣ Purchase check ---- */
  const { rows: purchaseRows } = await query(
    `
    SELECT 1
    FROM purchases
    WHERE user_id = $1
      AND content_id = $2
    `,
    [userId, contentId]
  );

  if (purchaseRows.length > 0) {
    req.contentId = contentId;
    return next(); // ✅ purchase grants access
  }

  /* =========================
     ACCESS DENIED
  ========================== */
  return res.status(403).json({
    error: "Subscription or purchase required to watch this content"
  });
};
