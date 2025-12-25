import express from "express";
import { buyContent } from "./purchases.controller.js";

const router = express.Router();

router.post("/:contentId", buyContent);

export default router;
