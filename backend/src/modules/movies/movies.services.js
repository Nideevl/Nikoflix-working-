import { query } from "../../config/db.js";

export const getMovieById = async (movieId) => {
  const { rows } = await query(
    `
    SELECT
      m.movie_id,
      m.duration,
      c.content_id,
      c.title,
      c.is_premium,
      c.ingest_status
    FROM movies m
    JOIN content c ON c.content_id = m.content_id
    WHERE m.movie_id = $1
    `,
    [movieId]
  );

  return rows[0];
};
