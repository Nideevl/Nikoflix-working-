import { query } from "../../config/db.js";

export const likeContent = async (
  userId,
  guestId,
  movieId,
  episodeId
) => {
  await query(
    `
    INSERT INTO likes (user_id, guest_id, movie_id, episode_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
    `,
    [userId, guestId, movieId, episodeId]
  );
};

export const unlikeContent = async (
  userId,
  guestId,
  movieId,
  episodeId
) => {
  await query(
    `
    DELETE FROM likes
    WHERE
      (user_id = $1 OR guest_id = $2)
      AND movie_id IS NOT DISTINCT FROM $3
      AND episode_id IS NOT DISTINCT FROM $4
    `,
    [userId, guestId, movieId, episodeId]
  );
};

export const getMovieLikeInfo = async (movieId, userId, guestId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM likes WHERE movie_id = $1`,
    [movieId]
  );

  let liked = false;

  if (userId) {
    const { rowCount } = await query(
      `SELECT 1 FROM likes WHERE movie_id = $1 AND user_id = $2`,
      [movieId, userId]
    );
    liked = rowCount === 1;
  } else if (guestId) {
    const { rowCount } = await query(
      `SELECT 1 FROM likes WHERE movie_id = $1 AND guest_id = $2`,
      [movieId, guestId]
    );
    liked = rowCount === 1;
  }

  return {
    count: rows[0].count,
    liked,
  };
};

export const getEpisodeLikeInfo = async (episodeId, userId, guestId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM likes WHERE episode_id = $1`,
    [movieId]
  );

  let liked = false;
  
  if (userId) {
    const { rowCount } = await query(
      `SELECT 1 FROM likes WHERE episode_id = $1 AND user_id = $2`,
      [episodeId, userId]
    ); 

    liked = rowCount === 1;
  } else if (guestId) {
    const { rowCount } = await query(
      `SELECT 1 FROM likes WHERE episode_id = $1 AND guest_id = $2`,
      [episodeId, guestId]
    );
    
    liked = rowCount === 1;
  }

  return {
    count: rows[0].count,
    liked,
  };
};
