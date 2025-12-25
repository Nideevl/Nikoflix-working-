import { query } from "../../config/db.js";

/* =======================
   CONTENT SERVICES
======================= */
export const createContent = async (title, type, isPremium) => {
  const { rows } = await query(
    `
    INSERT INTO content (title, type, is_premium)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [title, type, isPremium]
  );

  return rows[0];
};

export const updateContent = async (contentId, title, isPremium) => {
  const { rows } = await query(
    `
    UPDATE content
    SET
      title = COALESCE($2, title),
      is_premium = COALESCE($3, is_premium)
    WHERE content_id = $1
    RETURNING *
    `,
    [contentId, title, isPremium]
  );

  return rows[0];
};

export const deleteContent = async (contentId) => {
  const { rowCount } = await query(
    `
    DELETE FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  return rowCount > 0;
};

/* =======================
   EPISODE SERVICES
======================= */
export const createEpisode = async (
  contentId,
  episodeNumber,
  title,
  duration,
  videoUrl
) => {
  // Ensure content is a series
  const { rows: contentRows } = await query(
    `
    SELECT type
    FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  if (contentRows.length === 0) {
    throw new Error("Content not found");
  }

  if (contentRows[0].type !== "series") {
    throw new Error("Episodes can only be added to series content");
  }

  const { rows } = await query(
    `
    INSERT INTO episodes (
      content_id,
      episode_number,
      title,
      duration,
      video_url
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [contentId, episodeNumber, title, duration, videoUrl]
  );

  return rows[0];
};

export const updateEpisode = async (
  episodeId,
  episodeNumber,
  title,
  duration,
  videoUrl
) => {
  const { rows } = await query(
    `
    UPDATE episodes
    SET
      episode_number = COALESCE($2, episode_number),
      title = COALESCE($3, title),
      duration = COALESCE($4, duration),
      video_url = COALESCE($5, video_url)
    WHERE episode_id = $1
    RETURNING *
    `,
    [episodeId, episodeNumber, title, duration, videoUrl]
  );

  return rows[0];
};

export const deleteEpisode = async (episodeId) => {
  const { rowCount } = await query(
    `
    DELETE FROM episodes
    WHERE episode_id = $1
    `,
    [episodeId]
  );

  return rowCount > 0;
};

/* =======================
   MOVIE SERVICES
======================= */
export const updateMovie = async (
  movieId,
  duration,
  videoUrl
) => {
  const { rows } = await query(
    `
    UPDATE movies
    SET
      duration = COALESCE($2, duration),
      video_url = COALESCE($3, video_url)
    WHERE movie_id = $1
    RETURNING *
    `,
    [movieId, duration, videoUrl]
  );

  return rows[0];
};
