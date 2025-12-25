import { query } from "../../config/db.js";

export const buyContent = async (userId, contentId) => {
  // Ensure content exists
  const { rows: contentRows } = await query(
    `
    SELECT content_id
    FROM content
    WHERE content_id = $1
    `,
    [contentId]
  );

  if (contentRows.length === 0) {
    throw new Error("Content not found");
  }

  // Insert purchase (idempotent)
  const { rows } = await query(
    `
    INSERT INTO purchases (user_id, content_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, content_id) DO NOTHING
    RETURNING *
    `,
    [userId, contentId]
  );

  // If already purchased, fetch existing
  if (rows.length === 0) {
    const { rows: existing } = await query(
      `
      SELECT *
      FROM purchases
      WHERE user_id = $1 AND content_id = $2
      `,
      [userId, contentId]
    );

    return existing[0];
  }

  return rows[0];
};
