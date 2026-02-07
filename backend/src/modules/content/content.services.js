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

  console.log(contentId);
  const { rows } = await query(
    `
    SELECT content_id, is_premium, price, type
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

export const getContentCollection = async (contentId) => {
  // 1️⃣ Find root (parent or self)
  const { rows: baseRows } = await query(
    `
    SELECT content_id, parent_id
    FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  if (!baseRows.length) return null;

  const rootId = baseRows[0].parent_id || baseRows[0].content_id;

  const { rows } = await query(
    `
    WITH collection AS (
      SELECT *
      FROM content
      WHERE content_id = $1 OR parent_id = $1
    ),
    aggregated AS (
      SELECT
        c.content_id,

        ARRAY_AGG(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL) AS genres,

        COUNT(e.episode_id) AS episode_count,

        first_ep.episode_id AS first_episode_id,

        m.movie_id,
        m.duration

      FROM collection c
      LEFT JOIN content_genres cg ON cg.content_id = c.content_id
      LEFT JOIN genres g ON g.genre_id = cg.genre_id
      LEFT JOIN movies m ON m.content_id = c.content_id
      LEFT JOIN episodes e ON e.content_id = c.content_id
      LEFT JOIN LATERAL (
        SELECT e2.episode_id
        FROM episodes e2
        WHERE e2.content_id = c.content_id
        ORDER BY e2.episode_number ASC
        LIMIT 1
      ) first_ep ON TRUE

      GROUP BY
        c.content_id,
        m.movie_id,
        m.duration,
        first_ep.episode_id
    )
    SELECT
      c.content_id,
      c.content_id AS id,
      c.title,
      c.description,
      c.type,
      c.poster_1,
      c.poster_2,
      c.imdb_rating::text,
      c.release_date,
      c.ingest_status,
      a.genres,

      CASE
        WHEN c.type = 'movie' THEN a.duration::text
        ELSE a.episode_count::text
      END AS duration_or_episode_count,

      COALESCE(a.movie_id, a.first_episode_id) AS movie_or_episode_id,

      ROW_NUMBER() OVER (ORDER BY c.release_date) AS position,
      COUNT(*) OVER () AS length

    FROM collection c
    JOIN aggregated a ON a.content_id = c.content_id
    ORDER BY position
    `,
    [rootId]
  );

  return rows;
};

export const getSimilarContent = async (contentId) => {
  const { rows } = await query(
    `
    WITH target_genres AS (
      SELECT genre_id
      FROM content_genres
      WHERE content_id = $1
    ),
    matched_content AS (
      SELECT
        cg.content_id,
        COUNT(*) AS common_genres
      FROM content_genres cg
      JOIN target_genres tg ON tg.genre_id = cg.genre_id
      WHERE cg.content_id <> $1
      GROUP BY cg.content_id
      HAVING COUNT(*) >= 3
    )
    SELECT
      c.content_id,
      c.content_id AS id,
      c.title,
      c.description,
      c.type,
      c.poster_1,
      c.poster_2,
      c.imdb_rating::text,
      c.release_date,
      c.ingest_status,

      ARRAY_AGG(DISTINCT g.name) AS genres,

      CASE
        WHEN c.type = 'movie' THEN m.duration::text
        WHEN c.type = 'series' THEN COUNT(e.episode_id)::text
      END AS duration_or_episode_count,

      -- 🎥 movie OR first episode (NO UUID AGGREGATES)
      COALESCE(m.movie_id, first_ep.episode_id) AS movie_or_episode_id

    FROM matched_content mc
    JOIN content c ON c.content_id = mc.content_id

    LEFT JOIN content_genres cg ON cg.content_id = c.content_id
    LEFT JOIN genres g ON g.genre_id = cg.genre_id

    -- 🎬 one-to-one movie
    LEFT JOIN movies m ON m.content_id = c.content_id

    -- 📺 all episodes (for counting)
    LEFT JOIN episodes e ON e.content_id = c.content_id

    -- 📺 first episode only
    LEFT JOIN LATERAL (
      SELECT e2.episode_id
      FROM episodes e2
      WHERE e2.content_id = c.content_id
      ORDER BY e2.episode_number ASC
      LIMIT 1
    ) first_ep ON TRUE

    GROUP BY
      c.content_id,
      m.movie_id,
      m.duration,
      first_ep.episode_id,
      mc.common_genres

    ORDER BY mc.common_genres DESC, c.imdb_rating DESC NULLS LAST
    `,
    [contentId]
  );

  return rows;
};

