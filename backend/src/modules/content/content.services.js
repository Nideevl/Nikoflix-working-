import { query } from "../../config/db.js";

export const getAllContent = async () => {
  const { rows } = await query(
    `
    SELECT content_id, title, type, is_premium
    FROM content
    ORDER BY created_at DESC
    `
  );

  return rows;
};

export const getContentById = async (contentId) => {
  const { rows } = await query(
    `
    SELECT content_id, title, type, is_premium
    FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  return rows[0];
};

export const getEpisodesBySeries = async (contentId) => {
  // Ensure content exists and is a series
  const { rows: contentRows } = await query(
    `
    SELECT type
    FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  if (contentRows.length === 0) return null;
  if (contentRows[0].type !== "series") return [];

  const { rows } = await query(
    `
    SELECT
      episode_id,
      episode_number,
      title,
      duration
    FROM episodes
    WHERE content_id = $1
    ORDER BY episode_number ASC
    `,
    [contentId]
  );

  return rows;
};

