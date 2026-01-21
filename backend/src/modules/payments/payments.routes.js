import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  createContentPaymentOrder,
  razorpayWebhook  
} from "./payments.controller.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.post("/create-content-order", createContentPaymentOrder);
router.post("/webhook", express.raw({type: 'application/json'}), razorpayWebhook);

export default router;