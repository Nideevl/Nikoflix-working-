import axios from "axios";
import { query } from "../../config/db.js";
import { evictIfNeeded } from "./evictIfNeeded.js";

const INGEST_WORKER = process.env.INGEST_WORKER_URL;

export async function triggerIngest({
  type,        // movie | episode
  content_id,
  media_id,    // movie_id or episode_id
  source_url
}) {
  // 1️⃣ Evict if storage limit exceeded
  await evictIfNeeded();

  // 2️⃣ Mark as INGESTING (idempotent)
  const { rowCount } = await query(
    `
    UPDATE content
    SET ingest_status = 'INGESTING'
    WHERE content_id = $1
      AND ingest_status IN ('NOT_READY', 'EVICTED')
    `,
    [content_id]
  );

  if (rowCount === 0) {
    return; // already ingesting or ready
  }

  // 3️⃣ Send job to worker
  await axios.post(INGEST_WORKER, {
    type,
    id: media_id,
    source_url
  });
}
