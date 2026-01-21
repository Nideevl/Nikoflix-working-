import { query } from "../../config/db.js";
import { deleteFromBunny } from "../../utils/bunny.js";

const MAX_INGESTED = 20;

export async function evictIfNeeded() {
  // 1️⃣ Count READY items
  const { rows: countRows } = await query(`
    SELECT COUNT(*)::int AS count
    FROM content
    WHERE ingest_status = 'READY'
  `);

  if (countRows[0].count < MAX_INGESTED) {
    return; // ✅ nothing to evict
  }

  // 2️⃣ Find least recently used content
  const { rows } = await query(`
    SELECT
      c.content_id,
      c.type,
      COALESCE(c.last_accessed_at, c.created_at) AS lru_time,
      m.movie_id
    FROM content c
    LEFT JOIN movies m ON m.content_id = c.content_id
    WHERE c.ingest_status = 'READY'
    ORDER BY lru_time ASC
    LIMIT 1
  `);

  if (rows.length === 0) return;

  const evicted = rows[0];

  // 3️⃣ Build Bunny path
  let path;
  if (evicted.type === "movie") {
    path = `movie/${evicted.movie_id}`;
  } else {
    path = `episode/${evicted.episode_id}`;
  }

  // 4️⃣ Delete from Bunny
  await deleteFromBunny(path);

  // 5️⃣ Mark as EVICTED
  await query(
    `
    UPDATE content
    SET ingest_status = 'EVICTED'
    WHERE content_id = $1
    `,
    [evicted.content_id]
  );

  console.log("🧹 Evicted content:", path);
}
