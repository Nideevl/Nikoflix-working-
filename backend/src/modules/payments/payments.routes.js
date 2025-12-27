import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  createContentPaymentOrder
} from "./payments.controller.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.post("/create-content-order", createContentPaymentOrder);

export default router;
