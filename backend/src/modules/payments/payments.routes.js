import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  createContentPaymentOrder,
  paymentWebhook  
} from "./payments.controller.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.post("/create-content-order", createContentPaymentOrder);
router.post("/webhook", express.raw({type: 'application/json'}), paymentWebhook);

export default router;