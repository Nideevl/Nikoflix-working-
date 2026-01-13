import express from "express";
import { playbackAccessMiddleware } from "../../middlewares/access.middleware.js";

const router = express.Router();

// Movie playback
router.get("/movie/:movieId",
  playbackAccessMiddleware,
  async (req, res) => {
    const { movieId } = req.params;

    const { rows } = await db.query(`
      SELECT
        c.content_id,
        c.ingest_status,
        m.hls_manifest_url
      FROM movies m
      JOIN content c ON m.content_id = c.content_id
      WHERE m.movie_id = $1
    `, [movieId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const { content_id, ingest_status, hls_manifest_url } = rows[0];

    // Update LRU access time (fire-and-forget)
    await db.query(
      `UPDATE content SET last_accessed_at = now() WHERE content_id = $1`,
      [content_id]
    );

    if (ingest_status === "READY") {
      return res.json({
        status: "READY",
        manifest_url: hls_manifest_url
      });
    }

    if (ingest_status === "NOT_READY" || ingest_status === "EVICTED") {
      await triggerIngest(content_id);
      return res.status(202).json({ status: "PREPARING" });
    }

    if (ingest_status === "INGESTING") {
      return res.status(202).json({ status: "PREPARING" });
    }

    return res.status(500).json({ error: "Unknown ingest state" });
  }
);

// Episode playback
router.get("/episode/:episodeId",
  playbackAccessMiddleware,
  async (req, res) => {
    const { episodeId } = req.params;

    const { rows } = await db.query(`
      SELECT
        c.content_id,
        c.ingest_status,
        e.hls_manifest_url
      FROM episodes e
      JOIN content c ON e.content_id = c.content_id
      WHERE e.episode_id = $1
    `, [episodeId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Episode not found" });
    }

    const { content_id, ingest_status, hls_manifest_url } = rows[0];

    await db.query(
      `UPDATE content SET last_accessed_at = now() WHERE content_id = $1`,
      [content_id]
    );

    if (ingest_status === "READY") {
      return res.json({
        status: "READY",
        manifest_url: hls_manifest_url
      });
    }

    if (ingest_status === "NOT_READY" || ingest_status === "EVICTED") {
      await triggerIngest(content_id);
      return res.status(202).json({ status: "PREPARING" });
    }

    if (ingest_status === "INGESTING") {
      return res.status(202).json({ status: "PREPARING" });
    }

    return res.status(500).json({ error: "Unknown ingest state" });
  }
);


export default router;
