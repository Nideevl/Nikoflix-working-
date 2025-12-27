import { query } from "../../config/db.js";
import { razorpay } from "../../config/razorpay.js";

export const getPaymentById = async (paymentId) => {
  const { rows } = await query(
    `
    SELECT *
    FROM payments
    WHERE payment_id = $1
    `,
    [paymentId]
  );

  return rows[0] || null;
};

export const markPaymentSuccess = async (paymentId) => {
  await query(
    `
    UPDATE payments
    SET status = 'success'
    WHERE payment_id = $1
    `,
    [paymentId]
  );
};

export const createSubscriptionFromPayment = async (payment) => {
  // Fetch plan duration
  const { rows: planRows } = await query(
    `
    SELECT duration_days
    FROM plans
    WHERE plan_id = $1
    `,
    [payment.plan_id]
  );

  const durationDays = planRows[0].duration_days;

  // Deactivate existing (safety)
  await query(
    `
    UPDATE subscriptions
    SET is_active = false
    WHERE user_id = $1 AND is_active = true
    `,
    [payment.user_id]
  );

  // Create new subscription
  await query(
    `
    INSERT INTO subscriptions (
      user_id,
      plan_id,
      start_date,
      end_date,
      is_active
    )
    VALUES (
      $1,
      $2,
      NOW(),
      NOW() + ($3 || ' days')::interval,
      true
    )
    `,
    [payment.user_id, payment.plan_id, durationDays]
  );
};

export const createPurchaseFromPayment = async (payment) => {
  await query(
    `
    INSERT INTO purchases (
      user_id,
      content_id,
      created_at
    )
    VALUES ($1, $2, NOW())
    ON CONFLICT DO NOTHING
    `,
    [payment.user_id, payment.content_id]
  );
};

export const createPaymentOrder = async ({ userId, plan }) => {
  const { rows } = await query(
    `
    INSERT INTO payments (
      user_id,
      plan_id,
      amount,
      status,
      payment_gateway
    )
    VALUES ($1, $2, $3, 'pending', 'razorpay')
    RETURNING *
    `,
    [userId, plan.plan_id, plan.price]
  );

  return rows[0];
};

export const createContentPaymentOrder = async ({ userId, content }) => {
  if (content.price == null) {
    throw new Error("Premium content must have a price");
  }

  // Prevent duplicate pending
  const { rows: existing } = await query(
    `
    SELECT *
    FROM payments
    WHERE user_id = $1
      AND content_id = $2
      AND status = 'pending'
    LIMIT 1
    `,
    [userId, content.content_id]
  );

  if (existing.length > 0) {
    return existing[0];
  }

  // 🔐 REAL Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: content.price, // paise
    currency: "INR",
    receipt: `content_${content.content_id}_${Date.now()}`
  });

  // ✅ Store ORDER ID correctly
  const { rows } = await query(
    `
    INSERT INTO payments (
      user_id,
      content_id,
      amount,
      status,
      payment_gateway,
      provider_order_id,
      currency
    )
    VALUES ($1, $2, $3, 'pending', 'razorpay', $4, 'INR')
    RETURNING *
    `,
    [
      userId,
      content.content_id,
      content.price,
      razorpayOrder.id
    ]
  );

  return rows[0];
};

export const hasPurchasedContent = async (userId, contentId) => {
  const { rows } = await query(
    `
    SELECT 1
    FROM purchases
    WHERE user_id = $1
      AND content_id = $2
    LIMIT 1
    `,
    [userId, contentId]
  );

  return rows.length > 0;
};

export const getPaymentByOrderId = async (orderId) => {
  const { rows } = await query(
    `
    SELECT *
    FROM payments
    WHERE provider_order_id = $1
    `,
    [orderId]
  );
  return rows[0] || null;
};

export const markPaymentSuccessWithTxn = async (paymentId, txnId) => {
  await query(
    `
    UPDATE payments
    SET status = 'success',
        transaction_id = $2
    WHERE payment_id = $1
    `,
    [paymentId, txnId]
  );
};

export const grantEntitlement = async (payment) => {
  if (payment.plan_id) {
    await createSubscriptionFromPayment(payment);
  } else if (payment.content_id) {
    await createPurchaseFromPayment(payment);
  }
};