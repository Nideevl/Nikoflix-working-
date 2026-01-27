// comments.services.js

import { query } from "../../config/db.js";

// CREATE MOVIE COMMENT / REPLY
export const createMovieComment = async (
  userId,
  movieId,
  text,
  parentCommentId = null
) => {
  
  const { rows } = await query(
    `
    INSERT INTO comments (user_id, movie_id, comment, parent_comment_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [userId, movieId, text, parentCommentId]
  );
  return rows[0];
};

// CREATE EPISODE COMMENT / REPLY
export const createEpisodeComment = async (
  userId,
  episodeId,
  text,
  parentCommentId = null
) => {
  const { rows } = await query(
    `
    INSERT INTO comments (user_id, episode_id, comment, parent_comment_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [userId, episodeId, text, parentCommentId]
  );
  return rows[0];
};

// READ COMMENTS (THREAD READY)
export const getCommentsByMovie = async (movieId, userId) => {
  const { rows } = await query(
    `
    SELECT
      c.comment_id,
      c.comment,
      c.parent_comment_id,
      c.created_at,
      u.username,

      COUNT(cl.comment_id)::int AS like_count,

      CASE
        WHEN $2::uuid IS NULL THEN NULL
        ELSE BOOL_OR(cl.user_id = $2)
      END AS liked

    FROM comments c
    JOIN users u ON u.user_id = c.user_id
    LEFT JOIN comment_likes cl
      ON cl.comment_id = c.comment_id

    WHERE c.movie_id = $1

    GROUP BY c.comment_id, u.username
    ORDER BY c.created_at ASC
    `,
    [movieId, userId]
  );

  return rows;
};

export const getCommentsByEpisode = async (episodeId, userId) => {
  const { rows } = await query(
    `
    SELECT
      c.comment_id,
      c.comment,
      c.parent_comment_id,
      c.created_at,
      u.username,

      COUNT(cl.comment_id)::int AS like_count,

      CASE
        WHEN $2::uuid IS NULL THEN NULL
        ELSE BOOL_OR(cl.user_id = $2)
      END AS liked

    FROM comments c
    JOIN users u ON u.user_id = c.user_id
    LEFT JOIN comment_likes cl
      ON cl.comment_id = c.comment_id

    WHERE c.episode_id = $1

    GROUP BY c.comment_id, u.username
    ORDER BY c.created_at ASC
    `,
    [episodeId, userId]
  );

  return rows;
};

// DELETE (OWNER ONLY)
export const deleteComment = async (commentId, userId) => {
  const { rowCount } = await query(
    `
    DELETE FROM comments
    WHERE comment_id = $1 AND user_id = $2
    `,
    [commentId, userId]
  );
  return rowCount === 1;
};

export const likeComment = async (commentId, userId) => {
  await query(
    `
    INSERT INTO comment_likes (comment_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [commentId, userId]
  );
};

export const unlikeComment = async (commentId, userId) => {
  await query(
    `
    DELETE FROM comment_likes
    WHERE comment_id = $1 AND user_id = $2
    `,
    [commentId, userId]
  );
};

export const getParentCommentsByMovie = async (movieId, userId, limit = 20, offset = 0) => {
  const { rows } = await query(
    `
    SELECT
      c.comment_id,
      c.comment,
      c.parent_comment_id,
      c.created_at,
      u.username,

      COUNT(cl.comment_id)::int AS like_count,

      CASE
        WHEN $2::uuid IS NULL THEN NULL
        ELSE BOOL_OR(cl.user_id = $2)
      END AS liked,

      (
        SELECT COUNT(*)
        FROM comments r
        WHERE r.parent_comment_id = c.comment_id
      )::int AS reply_count

    FROM comments c
    JOIN users u ON u.user_id = c.user_id
    LEFT JOIN comment_likes cl ON cl.comment_id = c.comment_id

    WHERE c.movie_id = $1
      AND c.parent_comment_id IS NULL

    GROUP BY c.comment_id, u.username
    ORDER BY c.created_at DESC
    LIMIT $3 OFFSET $4
    `,
    [movieId, userId, limit, offset]
  );

  return rows;
};

export const getRepliesByComment = async (commentId, userId) => {
  const { rows } = await query(
    `
    SELECT
      c.comment_id,
      c.comment,
      c.parent_comment_id,
      c.created_at,
      u.username,

      COUNT(cl.comment_id)::int AS like_count,

      CASE
        WHEN $2::uuid IS NULL THEN NULL
        ELSE BOOL_OR(cl.user_id = $2)
      END AS liked,

      (
        SELECT COUNT(*)
        FROM comments r
        WHERE r.parent_comment_id = c.comment_id
      )::int AS reply_count   -- 🔥 ADD THIS

    FROM comments c
    JOIN users u ON u.user_id = c.user_id
    LEFT JOIN comment_likes cl ON cl.comment_id = c.comment_id

    WHERE c.parent_comment_id = $1

    GROUP BY c.comment_id, u.username
    ORDER BY c.created_at ASC
    `,
    [commentId, userId]
  );

  return rows;
};

