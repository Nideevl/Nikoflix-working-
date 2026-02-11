import express from "express";
import { playbackAccessMiddleware } from "../../middlewares/access.middleware.js";
import { query } from "../../config/db.js";
import { triggerIngest } from "../ingest/triggerIngest.js"

const router = express.Router();

// Movie playback
router.get("/movie/:movie_id", playbackAccessMiddleware, async (req, res) => {
  const { movie_id } = req.params;

  const { rows } = await query(
    `
    SELECT
      m.movie_id,
      m.source_url AS source_url,
      c.content_id,
      c.ingest_status
    FROM movies m
    JOIN content c ON c.content_id = m.content_id
    WHERE m.movie_id = $1
    `,
    [movie_id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Movie not found" });
  }

  const { content_id, ingest_status, source_url } = rows[0];

  // LRU update (non-blocking)
  query(
    `UPDATE content SET last_accessed_at = now() WHERE content_id = $1`,
    [content_id]
  ).catch(() => { });

  if (ingest_status === "READY") {
    const path = `/movie/${movie_id}/master.m3u8`;
    const signedUrl = generateBunnySignedUrl(path);

    return res.json({
      status: "READY",
      source: signedUrl
    });
  }

  if (ingest_status === "NOT_READY") {
    await triggerIngest({
      type: "movie",
      content_id,
      media_id: movie_id,
      source_url
    });

    return res.status(202).json({ status: "PREPARING" });
  }

  if (ingest_status === "INGESTING") {
    return res.status(202).json({ status: "PREPARING" });
  }

  return res.status(409).json({
    status: ingest_status,
    error: "Content not available"
  });
});


// Episode playback
router.get("/episode/:episode_id", playbackAccessMiddleware, async (req, res) => {
  const { episode_id } = req.params;

  const { rows } = await query(
    `
    SELECT
      e.episode_id,
      e.source_url AS source_url,
      c.content_id,
      c.ingest_status
    FROM episodes e
    JOIN content c ON c.content_id = e.content_id
    WHERE e.episode_id = $1
    `,
    [episode_id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Episode not found" });
  }

  const { content_id, ingest_status, source_url } = rows[0];

  query(
    `UPDATE content SET last_accessed_at = now() WHERE content_id = $1`,
    [content_id]
  ).catch(() => { });

  if (ingest_status === "READY") {
    const path = `/episode/${episode_id}/master.m3u8`;
    const signedUrl = generateBunnySignedUrl(path);

    return res.json({
      status: "READY",
      source: signedUrl
    });
  }

  if (ingest_status === "NOT_READY") {
    await triggerIngest({
      type: "episode",
      content_id,
      media_id: episode_id, // ✅ FIX
      source_url
    });

    return res.status(202).json({ status: "PREPARING" });
  }

  if (ingest_status === "INGESTING") {
    return res.status(202).json({ status: "PREPARING" });
  }

  return res.status(409).json({
    status: ingest_status,
    error: "Content not available"
  });
});



export default router;
