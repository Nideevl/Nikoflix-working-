import express from "express";
import { query } from "../../config/db.js";

const router = express.Router();

router.post("/ingest/callback", async (req, res) => {
  const { content_id: movie_id, status } = req.body;

  if (!movie_id || !status) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (!movie_id || !status) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    /* 1️⃣ Find content_id using movie_id */
    const { rows } = await query(
      `SELECT content_id FROM movies WHERE movie_id = $1`,
      [movie_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Movie not found for callback" });
    }

    const content_id = rows[0].content_id;

    /* 2️⃣ Update ingest state */
    if (status === "READY") {
      await query(
        `UPDATE content SET ingest_status = 'READY' WHERE content_id = $1`,
        [content_id]
      );
    }

    if (status === "FAILED") {
      await query(
        `UPDATE content SET ingest_status = 'NOT_READY' WHERE content_id = $1`,
        [content_id]
      );
    }

    res.json({ ok: true });

  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "DB update failed" });
  }
});

export default router;
