// routes/internal/ingestCallback.js

import express from "express";
import { query } from "../../config/db.js";

const router = express.Router();

router.post("/ingest/callback", async (req, res) => {
  const { content_id, status } = req.body;

  if (!content_id || !status) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
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
