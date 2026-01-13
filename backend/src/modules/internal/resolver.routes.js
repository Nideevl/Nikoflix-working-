import express from "express";
import { resolveSourceUrl } from "./resolver.services.js";

const router = express.Router();

/**
 * INTERNAL ONLY
 * Used by ingest worker
 */
router.post("/resolve-source", async (req, res) => {
  try {
    const { source_url } = req.body;

    if (!source_url) {
      return res.status(400).json({ error: "source_url required" });
    }

    const result = await resolveSourceUrl(source_url);

    return res.json(result);
  } catch (err) {
    console.error("Resolver error:", err.message);
    return res.status(502).json({ error: "Resolver service failed" });
  }
});

export default router;
