import cloudinary from "../../config/cloudinary.js";
import { query } from "../../config/db.js";
import { pool } from "../../config/db.js";
import { extractPublicId } from "../../utils/cloudinaryUtils.js";

// 🎬 MOVIES
export async function searchMoviesService(para) {
  const { rows } = await query(
    `
    SELECT c.*, m.duration, m.source_url
    FROM content c
    JOIN movies m ON c.content_id = m.content_id
    WHERE c.type = 'movie'
      AND c.title ILIKE $1
    LIMIT 20
    `,
    [`%${para}%`]
  );
  return rows;
}
export async function updateMovieService(contentId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      title,
      description,
      imdb_rating,
      release_date,
      is_premium,
      price,
      poster_1,
      poster_2,
      ingest_status,
      duration,
      source_url,
      parent_id = null,
      genre_ids = [], // ✅ match frontend
    } = data;

    // 1️⃣ Get old posters
    const { rows } = await client.query(
      `SELECT poster_1, poster_2 FROM content WHERE content_id=$1`,
      [contentId]
    );

    const oldPoster1 = rows[0]?.poster_1;
    const oldPoster2 = rows[0]?.poster_2;

    // 2️⃣ Delete old posters if changed
    if (poster_1 && oldPoster1 && oldPoster1 !== poster_1) {
      const id1 = extractPublicId(oldPoster1);
      if (id1) await cloudinary.uploader.destroy(id1);
    }

    if (poster_2 && oldPoster2 && oldPoster2 !== poster_2) {
      const id2 = extractPublicId(oldPoster2);
      if (id2) await cloudinary.uploader.destroy(id2);
    }

    // 3️⃣ Update content table
    await client.query(
      `
      UPDATE content SET
        title=$1,
        description=$2,
        parent_id=$3,
        imdb_rating=$4,
        release_date=$5,
        is_premium=$6,
        price=$7,
        poster_1=$8,
        poster_2=$9,
        ingest_status=$10
      WHERE content_id=$11
      `,
      [
        title?.trim(),
        description?.trim() || null,
        parent_id,
        imdb_rating ?? null,
        release_date ?? null,
        is_premium ?? false,
        price ?? null,
        poster_1 || null,
        poster_2 || null,
        ingest_status || "NOT_READY",
        contentId,
      ]
    );

    // 4️⃣ Update movies table
    await client.query(
      `
      UPDATE movies SET
        duration=$1,
        source_url=$2
      WHERE content_id=$3
      `,
      [duration ?? null, source_url?.trim() || null, contentId]
    );

    // 5️⃣ Update genres (smart way)

    // delete old genres
    await client.query(
      `DELETE FROM content_genres WHERE content_id=$1`,
      [contentId]
    );

    // bulk insert new genres
    if (genre_ids.length > 0) {
      const values = genre_ids
        .map((_, i) => `($1, $${i + 2})`)
        .join(",");

      await client.query(
        `
        INSERT INTO content_genres (content_id, genre_id)
        VALUES ${values}
        `,
        [contentId, ...genre_ids]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
export async function bulkCreateMoviesService(movies) {
  const client = await pool.connect();
  const results = [];

  try {
    await client.query("BEGIN");
    console.log(movies);

    for (const movie of movies) {
      const {
        title,
        description,
        is_premium,
        price,
        source_url,
        imdb_rating,
        release_date,
        genre_ids = [],
        duration,
        parent_id = null, 
      } = movie;

      // 1️⃣ Insert into content
      const { rows } = await client.query(
        `
        INSERT INTO content (
          title, 
          description, 
          type, 
          parent_id,
          imdb_rating, 
          release_date, 
          is_premium, 
          price
        )
        VALUES ($1,$2,'movie',$3,$4,$5,$6,$7)
        RETURNING content_id
        `,
        [
          title?.trim(),
          description?.trim() || null,
          parent_id,
          imdb_rating ?? null,
          release_date ?? null,
          is_premium ?? false,
          price ?? null,
        ]
      );

      const contentId = rows[0].content_id;

      // 2️⃣ Insert into movies table
      await client.query(
        `
        INSERT INTO movies (content_id, duration, source_url)
        VALUES ($1,$2,$3)
        `,
        [contentId, duration, source_url?.trim() || null]
      );

      // 3️⃣ Insert genres into content_genres
      if (genre_ids.length > 0) {
        for (const genreId of genre_ids) {
          await client.query(
            `
            INSERT INTO content_genres (content_id, genre_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            `,
            [contentId, genreId]
          );
        }
      }

      results.push(contentId);
    }

    await client.query("COMMIT");
    return results;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
export async function deleteMovieService(contentId) {

    const { rows } = await query(
      `SELECT poster_1, poster_2 FROM content WHERE content_id=$1`,
      [contentId]
    );

    const poster1 = rows[0]?.poster_1;
    const poster2 = rows[0]?.poster_2;

    // 2️⃣ Delete from DB (movies → content)
    await query(`DELETE FROM content WHERE content_id=$1`, [contentId]);

    // 3️⃣ Delete posters from Cloudinary AFTER DB success
    if (poster1) {
      const id1 = extractPublicId(poster1);
      if (id1) await cloudinary.uploader.destroy(id1);
    }

    if (poster2) {
      const id2 = extractPublicId(poster2);
      if (id2) await cloudinary.uploader.destroy(id2);
    }
}

// 📺 SERIES
export async function searchSeriesService(para) {
  
  try {
    const { rows } = await query(
      `
      SELECT * FROM content
      WHERE type='series'
        AND title ILIKE $1
      LIMIT 20
      `,
      [`%${para}%`]
    );
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}
export async function bulkCreateSeriesService(seriesList) {
  const client = await pool.connect();
  const results = [];

  try {
    await client.query("BEGIN");

    for (const s of seriesList) {
      const {
        title,
        description,
        imdb_rating,
        release_date,
        is_premium,
        price,
        parent_id = null,      // ✅ added
        genre_ids = [],        // ✅ consistent with movies
      } = s;

      // 1️⃣ Insert into content table
      const { rows } = await client.query(
        `
        INSERT INTO content (
          title, description, type, parent_id, imdb_rating, release_date, is_premium, price
        )
        VALUES ($1,$2,'series',$3,$4,$5,$6,$7)
        RETURNING content_id
        `,
        [
          title?.trim(),
          description?.trim() || null,
          parent_id,
          imdb_rating ?? null,
          release_date ?? null,
          is_premium ?? false,
          price ?? null,
        ]
      );

      const contentId = rows[0].content_id;
      results.push(contentId);

      // 2️⃣ Insert genres (bulk insert like movies 🚀)
      if (genre_ids.length > 0) {
        const values = genre_ids
          .map((_, i) => `($1, $${i + 2})`)
          .join(",");

        await client.query(
          `
          INSERT INTO content_genres (content_id, genre_id)
          VALUES ${values}
          `,
          [contentId, ...genre_ids]
        );
      }
    }

    await client.query("COMMIT");
    return results;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
export async function updateSeriesService(contentId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      title,
      description,
      imdb_rating,
      release_date,
      is_premium,
      price,
      poster_1,
      poster_2,
      ingest_status,
      parent_id = null,      // ✅ added
      genre_ids = [],
    } = data;

    // 1️⃣ Get old posters
    const { rows } = await client.query(
      `SELECT poster_1, poster_2 FROM content WHERE content_id=$1`,
      [contentId]
    );

    if (rows.length === 0) {
      throw new Error("Series not found");
    }

    const oldPoster1 = rows[0].poster_1;
    const oldPoster2 = rows[0].poster_2;

    // 2️⃣ Update content table
    await client.query(
      `
      UPDATE content SET
        title=$1,
        description=$2,
        imdb_rating=$3,
        release_date=$4,
        is_premium=$5,
        price=$6,
        poster_1=$7,
        poster_2=$8,
        ingest_status=$9,
        parent_id=$10
      WHERE content_id=$11
      `,
      [
        title?.trim(),
        description?.trim() || null,
        imdb_rating ?? null,
        release_date ?? null,
        is_premium ?? false,
        price ?? null,
        poster_1 ?? null,
        poster_2 ?? null,
        ingest_status ?? "NOT_READY",
        parent_id,
        contentId,
      ]
    );

    // 3️⃣ Update genres (fast bulk insert 🚀)
    await client.query(
      `DELETE FROM content_genres WHERE content_id=$1`,
      [contentId]
    );

    if (genre_ids.length > 0) {
      const values = genre_ids
        .map((_, i) => `($1, $${i + 2})`)
        .join(",");

      await client.query(
        `
        INSERT INTO content_genres (content_id, genre_id)
        VALUES ${values}
        `,
        [contentId, ...genre_ids]
      );
    }

    await client.query("COMMIT");

    // 4️⃣ Delete old posters from Cloudinary AFTER commit ✅
    if (oldPoster1 && oldPoster1 !== poster_1) {
      const id1 = extractPublicId(oldPoster1);
      if (id1) await cloudinary.uploader.destroy(id1);
    }

    if (oldPoster2 && oldPoster2 !== poster_2) {
      const id2 = extractPublicId(oldPoster2);
      if (id2) await cloudinary.uploader.destroy(id2);
    }

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
export async function deleteSeriesService(contentId) {

    const { rows } = await query(
      `SELECT poster_1, poster_2 FROM content WHERE content_id=$1`,
      [contentId]
    );

    const poster1 = rows[0]?.poster_1;
    const poster2 = rows[0]?.poster_2;

    // Episodes will be deleted automatically because of FK ON DELETE CASCADE
    await query(`DELETE FROM content WHERE content_id=$1`, [contentId]);

    // Delete posters from Cloudinary
    if (poster1) {
      const id1 = extractPublicId(poster1);
      if (id1) await cloudinary.uploader.destroy(id1);
    }

    if (poster2) {
      const id2 = extractPublicId(poster2);
      if (id2) await cloudinary.uploader.destroy(id2);
    }
}

// 🎬 EPISODES
export async function getEpisodesBySeriesService(contentId) {
  const { rows } = await query(
    `
    SELECT * FROM episodes
    WHERE content_id=$1
    ORDER BY episode_number
    `,
    [contentId]
  );
  return rows;
}
export async function bulkCreateEpisodesService(contentId, episodes) {
  for (const ep of episodes) {
    await pool.query(
      `
      INSERT INTO episodes (content_id, episode_number, title, duration, source_url)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        contentId,
        ep.episode_number,
        ep.title || null,
        ep.duration || null,
        ep.source_url || null,
      ]
    );
  }
}
export async function bulkUpdateEpisodesService(episodes) {
  for (const ep of episodes) {
    await query(
      `
      UPDATE episodes SET
        episode_number=$1,
        title=$2,
        duration=$3,
        source_url=$4
      WHERE episode_id=$5
      `,
      [
        ep.episode_number,
        ep.title,
        ep.duration,
        ep.source_url,
        ep.episode_id,
      ]
    );
  }
}
export async function deleteEpisodeService(episodeId) {
  await query(`DELETE FROM episodes WHERE episode_id=$1`, [episodeId]);
}
