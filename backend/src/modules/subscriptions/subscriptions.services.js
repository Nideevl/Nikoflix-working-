import { query } from "../../config/db.js";

export const getAllPlans = async () => {
  const { rows } = await query(
    `
    SELECT plan_id, name, price, duration_days
    FROM plans
    ORDER BY duration_days
    `
  );
  return rows;
};

export const getActiveSubscription = async (userId) => {
  const { rows } = await query(
    `
    SELECT
      s.subscription_id,
      s.plan_id,
      s.start_date,
      s.end_date,
      p.name,
      p.price,
      p.duration_days
    FROM subscriptions s
    JOIN plans p ON p.plan_id = s.plan_id
    WHERE s.user_id = $1
      AND s.is_active = true
      AND s.end_date > NOW()
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

export const hasActiveSubscription = async (userId) => {
  const { rows } = await query(
    `
    SELECT 1
    FROM subscriptions
    WHERE user_id = $1
      AND is_active = true
      AND end_date > NOW()
    LIMIT 1
    `,
    [userId]
  );

  return rows.length > 0;
};

export const getPlanById = async (planId) => {
  const { rows } = await query(
    `
    SELECT plan_id, name, price, duration_days
    FROM plans
    WHERE plan_id = $1
    `,
    [planId]
  );

  return rows[0] || null;
};
