import { query } from "../../config/db.js";

export const getEpisodeById = async (episodeId) => {
  const { rows } = await query(
    `
    SELECT
      e.episode_id,
      e.episode_number,
      e.duration,
      c.content_id,
      c.title,
      c.is_premium,
      c.ingest_status
    FROM episodes e
    JOIN content c ON c.content_id = e.content_id
    WHERE e.episode_id = $1
    `,
    [episodeId]
  );

  return rows[0] || null;
};
