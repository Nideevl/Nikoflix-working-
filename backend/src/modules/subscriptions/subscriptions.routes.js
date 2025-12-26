import express from "express";
import { 
    getSubscriptions,
    createSubscriptionIntent 
    } from "./subscriptions.controller.js";

const router = express.Router();

router.get("/", getSubscriptions);
router.post("/intent", createSubscriptionIntent);

export default router;
