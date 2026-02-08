// import { query } from "../../config/db.js";
// import { razorpay } from "../../config/razorpay.js";
// import crypto from "crypto"; // For webhook verification (optional but recommended)


// export const createRazorpayOrder = async ({
//   userId,
//   amount, // in rupees, e.g., 199.00
//   contentId = null,
//   planId = null
// }) => {
//   const orderAmount = Math.round(amount * 100); // Convert to paise

//   const order = await razorpay.orders.create({
//     amount: orderAmount,
//     currency: "INR",
//     receipt: `receipt_${Date.now()}`
//   });

//   // Insert pending payment record (same structure)
//   await query(
//     `
//     INSERT INTO payments (
//       user_id, content_id, plan_id, amount, payment_gateway,
//       provider_order_id, status, currency
//     )
//     VALUES ($1, $2, $3, $4, 'razorpay', $5, 'pending', 'INR')
//     `,
//     [userId, contentId, planId, amount, order.id]
//   );

//   return {
//     orderId: order.id,
//     amount: order.amount, // in paise
//     currency: order.currency,
//     key_id: process.env.RAZORPAY_KEY_ID
//   };
// };

// // For verification (webhook or server-side)
// export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
//   const generatedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(`${razorpayOrderId}|${razorpayPaymentId}`)
//     .digest("hex");

//   return generatedSignature === razorpaySignature;
// };

// export const getPaymentById = async (paymentId) => {
//   const { rows } = await query(
//     `
//     SELECT *
//     FROM payments
//     WHERE payment_id = $1
//     `,
//     [paymentId]
//   );

//   return rows[0] || null;
// };

// export const markPaymentSuccess = async (paymentId) => {
//   await query(
//     `
//     UPDATE payments
//     SET status = 'success'
//     WHERE payment_id = $1
//     `,
//     [paymentId]
//   );
// };

// export const createSubscriptionFromPayment = async (payment) => {
//   // Fetch plan duration
//   const { rows: planRows } = await query(
//     `
//     SELECT duration_days
//     FROM plans
//     WHERE plan_id = $1
//     `,
//     [payment.plan_id]
//   );

//   const durationDays = planRows[0].duration_days;

//   // Deactivate existing (safety)
//   await query(
//     `
//     UPDATE subscriptions
//     SET is_active = false
//     WHERE user_id = $1 AND is_active = true
//     `,
//     [payment.user_id]
//   );

//   // Create new subscription
//   await query(
//     `
//     INSERT INTO subscriptions (
//       user_id,
//       plan_id,
//       start_date,
//       end_date,
//       is_active
//     )
//     VALUES (
//       $1,
//       $2,
//       NOW(),
//       NOW() + ($3 || ' days')::interval,
//       true
//     )
//     `,
//     [payment.user_id, payment.plan_id, durationDays]
//   );
// };

// export const createPurchaseFromPayment = async (payment) => {
//   await query(
//     `
//     INSERT INTO purchases (
//       user_id,
//       content_id,
//       created_at
//     )
//     VALUES ($1, $2, NOW())
//     ON CONFLICT DO NOTHING
//     `,
//     [payment.user_id, payment.content_id]
//   );
// };

// export const createPaymentOrder = async ({ userId, plan }) => {
//   const { rows } = await query(
//     `
//     INSERT INTO payments (
//       user_id,
//       plan_id,
//       amount,
//       status,
//       payment_gateway
//     )
//     VALUES ($1, $2, $3, 'pending', 'razorpay')
//     RETURNING *
//     `,
//     [userId, plan.plan_id, plan.price]
//   );

//   return rows[0];
// };

// export const createContentPaymentOrder = async ({ userId, content }) => {
//   if (content.price == null) {
//     throw new Error("Premium content must have a price");
//   }

//   // Prevent duplicate pending (optional, keep if you want)
//   const { rows: existing } = await query(
//     `
//     SELECT *
//     FROM payments
//     WHERE user_id = $1
//       AND content_id = $2
//       AND status = 'pending'
//     LIMIT 1
//     `,
//     [userId, content.content_id]
//   );

//   if (existing.length > 0) {
//     return existing[0];
//   }

//   // Create dynamic fixed-amount QR Code via Razorpay API
//   const qrResponse = await razorpay.qrCode.create({
//     type: "upi_qr", // UPI QR
//     name: `Content_${content.content_id}`,
//     usage: "single_use", // One-time use (closes after payment) — or "multiple_use" if reusable
//     fixed_amount: true,
//     payment_amount: content.price, // in paise! e.g., 19900 for ₹199
//     description: `Purchase ${content.title || 'content'}`,
//     // Optional: customer_id if you have Razorpay customer
//     // close_by: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // UNIX timestamp, optional expiry
//   });

//   // Store in DB with provider_order_id as QR ID
//   const { rows } = await query(
//     `
//     INSERT INTO payments (
//       user_id,
//       content_id,
//       amount,
//       status,
//       payment_gateway,
//       provider_order_id,  // QR Code ID
//       currency,
//       qr_image_url
//     )
//     VALUES ($1, $2, $3, 'pending', 'razorpay_qr', $4, 'INR', $5)
//     RETURNING *
//     `,
//     [
//       userId,
//       content.content_id,
//       content.price,
//       qrResponse.id,
//       qrResponse.image_url // or short_url if you prefer link
//     ]
//   );

//   return rows[0];
// };

// export const hasPurchasedContent = async (userId, contentId) => {
//   const { rows } = await query(
//     `
//     SELECT 1
//     FROM purchases
//     WHERE user_id = $1
//       AND content_id = $2
//     LIMIT 1
//     `,
//     [userId, contentId]
//   );

//   return rows.length > 0;
// };

// export const getPaymentByOrderId = async (orderId) => {
//   const { rows } = await query(
//     `
//     SELECT *
//     FROM payments
//     WHERE provider_order_id = $1
//     `,
//     [orderId]
//   );
//   return rows[0] || null;
// };

// export const markPaymentSuccessWithTxn = async (paymentId, txnId) => {
//   await query(
//     `
//     UPDATE payments
//     SET status = 'success',
//         transaction_id = $2
//     WHERE payment_id = $1
//     `,
//     [paymentId, txnId]
//   );
// };

// export const grantEntitlement = async (payment) => {
//   if (payment.plan_id) {
//     await createSubscriptionFromPayment(payment);
//   } else if (payment.content_id) {
//     await createPurchaseFromPayment(payment);
//   }
// };