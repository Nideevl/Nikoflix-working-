import { query } from "../../config/db.js";

export const createMovieComment = async (userId, movieId, text) => {
  const { rows } = await query(
    `
    INSERT INTO comments (user_id, movie_id, comment)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [userId, movieId, text]
  );
  return rows[0];
};

export const createEpisodeComment = async (userId, episodeId, text) => {
  const { rows } = await query(
    `
    INSERT INTO comments (user_id, episode_id, comment)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [userId, episodeId, text]
  );
  return rows[0];
};

export const getCommentsByMovie = async (movieId) => {
  const { rows } = await query(
    `
    SELECT
      c.comment_id,
      c.comment,
      c.created_at,
      u.username
    FROM comments c
    JOIN users u ON u.user_id = c.user_id
    WHERE c.movie_id = $1
    ORDER BY c.created_at DESC
    `,
    [movieId]
  );
  return rows;
};

export const getCommentsByEpisode = async (episodeId) => {
  const { rows } = await query(
    `
    SELECT
      c.comment_id,
      c.comment,
      c.created_at,
      u.username
    FROM comments c
    JOIN users u ON u.user_id = c.user_id
    WHERE c.episode_id = $1
    ORDER BY c.created_at DESC
    `,
    [episodeId]
  );
  return rows;
};

export const deleteComment = async (commentId, userId) => {
  const { rowCount } = await query(
    `
    DELETE FROM comments
    WHERE comment_id = $1
      AND user_id = $2
    `,
    [commentId, userId]
  );

  return rowCount; // 0 or 1
};

