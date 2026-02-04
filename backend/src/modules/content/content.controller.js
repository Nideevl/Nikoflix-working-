import * as contentService from "./content.services.js";
import { query } from "../../config/db.js";

export const getAllContent = async (req, res) => {
  const content = await contentService.getAllContent();
  res.json(content);
};

export const getContentById = async (req, res) => {
  const { contentId } = req.params;

  const content = await contentService.getContentById(contentId);

  if (!content) {
    return res.status(404).json({ error: "Content not found" });
  }

  res.json(content);
};

export const getEpisodesBySeries = async (req, res) => {
  const { contentId } = req.params;

  const episodes = await contentService.getEpisodesBySeries(contentId);

  if (!episodes) {
    return res.status(404).json({
      error: "Series not found"
    });
  }

  res.json(episodes);
};

export const getContentRow = async (req, res) => {
  try {
    const { count = 10, type, genre } = req.query;
    console.log("Query params:", req.query);

    const limit = Math.min(Number(count) || 10, 50);

    const values = [];
    const where = [];

    // 🎬 TYPE FILTER
    if (type === "movie" || type === "series") {
      values.push(type);
      where.push(`c.type = $${values.length}`);
    }

    // 🎭 GENRE FILTER (by genre_id)
    if (genre) {
      const genreIds = genre.split("+").map(Number).filter(Boolean);
      if (genreIds.length) {
        values.push(genreIds);
        where.push(`cg.genre_id = ANY($${values.length})`);
      }
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
   SELECT
  c.content_id,
  c.title,
  c.description,
  c.type,
  c.poster_1,
  c.poster_2,
  c.imdb_rating,
  c.release_date,
  c.ingest_status,

  ARRAY_AGG(DISTINCT g.name) AS genres,

  CASE
    WHEN c.type = 'movie' THEN m.duration::text
    WHEN c.type = 'series' THEN COUNT(e.episode_id)::text
  END AS duration_or_episode_count,

  -- ✅ NO AGGREGATES ON UUIDS
  COALESCE(m.movie_id, first_ep.episode_id) AS movie_or_episode_id

FROM content c

LEFT JOIN content_genres cg ON cg.content_id = c.content_id
LEFT JOIN genres g ON g.genre_id = cg.genre_id

-- 🎬 one-to-one movie
LEFT JOIN movies m ON m.content_id = c.content_id

-- 📺 all episodes (for counting)
LEFT JOIN episodes e ON e.content_id = c.content_id

-- 📺 FIRST episode ONLY (no aggregation)
LEFT JOIN LATERAL (
  SELECT e2.episode_id
  FROM episodes e2
  WHERE e2.content_id = c.content_id
  ORDER BY e2.episode_number ASC
  LIMIT 1
) first_ep ON TRUE

${whereSQL}

GROUP BY
  c.content_id,
  m.movie_id,
  m.duration,
  first_ep.episode_id

ORDER BY RANDOM()
LIMIT $${values.length + 1}

              `;

    values.push(limit);

    const { rows } = await query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("getContentRow error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getContentCollection = async (req, res) => {
  const { contentId } = req.params;

  const collection = await contentService.getContentCollection(contentId);

  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  res.json(collection);
};

export const getSimilarContent = async (req, res) => {
  try {
    const { contentId, count } = req.params;

    const limit = Math.min(Number(count) || 10, 50);

    const results = await contentService.getSimilarContent(contentId, limit);

    res.json(results);
  } catch (err) {
    console.error("getSimilarContent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
