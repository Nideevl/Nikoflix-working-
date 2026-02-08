// import * as paymentService from "./payments.services.js";
// import * as subscriptionService from "../subscriptions/subscriptions.services.js";
// import * as contentService from "../content/content.services.js";
// import crypto from "crypto";

// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment payload" });
//     }

//     // 1️⃣ Signature verification
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment signature" });
//     }

//     // 2️⃣ Fetch payment by order_id
//     const payment = await paymentService.getPaymentByOrderId(
//       razorpay_order_id
//     );

//     if (!payment) {
//       return res.status(404).json({ error: "Payment record not found" });
//     }

//     // 3️⃣ Idempotency
//     if (payment.status === "success") {
//       return res.json({ message: "Payment already verified" });
//     }

//     // 4️⃣ Mark success + store transaction id
//     await paymentService.markPaymentSuccessWithTxn(
//       payment.payment_id,
//       razorpay_payment_id
//     );

//     // 5️⃣ Grant entitlement
//     await paymentService.grantEntitlement(payment);

//     res.json({ message: "Payment verified and access granted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Payment verification failed" });
//   }
// };

// export const createPaymentOrder = async (req, res) => {
//   try {
//     // 1️⃣ Must be logged in
//     if (req.identity.type !== "user") {
//       return res.status(401).json({
//         error: "Login required"
//       });
//     }

//     const userId = req.identity.user_id;
//     const { plan_id } = req.body;

//     if (!plan_id) {
//       return res.status(400).json({
//         error: "plan_id is required"
//       });
//     }

//     // 2️⃣ No active subscription allowed
//     const hasActive =
//       await subscriptionService.hasActiveSubscription(userId);

//     if (hasActive) {
//       return res.status(409).json({
//         error: "User already has an active subscription"
//       });
//     }

//     // 3️⃣ Validate plan
//     const plan = await subscriptionService.getPlanById(plan_id);

//     if (!plan) {
//       return res.status(404).json({
//         error: "Plan not found"
//       });
//     }

//     // 4️⃣ Create payment order (mock Razorpay)
//     const payment = await paymentService.createPaymentOrder({
//       userId,
//       plan
//     });

//     res.status(201).json({
//       payment_id: payment.payment_id,
//       amount: payment.amount,
//       status: payment.status
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       error: "Failed to create payment order"
//     });
//   }
// };

// export const createContentPaymentOrder = async (req, res) => {
//   try {
//     if (req.identity.type !== "user") {
//       return res.status(401).json({ error: "Login required" });
//     }

//     const userId = req.identity.user_id;
//     const { content_id } = req.body;

//     if (!content_id) {
//       return res.status(400).json({ error: "content_id is required" });
//     }

//     // 1️⃣ Validate content
//     const content = await contentService.getContentById(content_id);

//     if (!content) {
//       return res.status(404).json({ error: "Content not fouknd" });
//     }

//     if (!content.is_premium) {
//       return res.status(400).json({
//         error: "Free content does not need to be purchased"
//       });
//     }

//     // 2️⃣ Check already purchased
//     const alreadyPurchased =
//       await paymentService.hasPurchasedContent(userId, content_id);

//     if (alreadyPurchased) {
//       return res.status(409).json({
//         error: "Content already purchased"
//       });
//     }

//     const payment = await paymentService.createContentPaymentOrder({
//       userId,
//       content
//     });

//     res.status(201).json({
//       payment_id: payment.payment_id,
//       amount: payment.amount,
//       status: payment.status,
//       qr_image_url: payment.qr_image_url, // Send to frontend to display
//       qr_id: payment.provider_order_id
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       error: "Failed to create content payment order"
//     });
//   }
// };

// // For callback/webhook (recommended for production, but optional for demo)
// export const razorpayWebhook = async (req, res) => {
//   const body = req.body;

//   if (body.event === "payment.captured") {
//     const payment = await paymentService.getPaymentByOrderId(
//       body.payload.payment.entity.order_id
//     );

//     if (payment && payment.status !== "success") {
//       await paymentService.markPaymentSuccessWithTxn(
//         payment.payment_id,
//         body.payload.payment.entity.id
//       );
//       await paymentService.grantEntitlement(payment);
//     }
//   }

//   res.status(200).send("OK");
// };
