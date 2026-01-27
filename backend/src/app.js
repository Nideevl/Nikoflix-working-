import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import { identityMiddleware } from './middlewares/auth.middleware.js';
import commentsRoutes from "./modules/comments/comments.routes.js";
import likesRoutes from "./modules/likes/likes.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import playbackRoutes from "./modules/playback/playback.routes.js";
import movieRoutes from "./modules/movies/movies.routes.js";
import purchaseRoutes from "./modules/payments/payments.routes.js";
import subscriptionsRoutes from "./modules/subscriptions/subscriptions.routes.js"
import paymentsRoutes from "./modules/payments/payments.routes.js";

const app = express(); // new Express application instance

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json()); // Automatically parses incoming JSON request bodies
app.use("/admin", adminRoutes);

app.use(identityMiddleware); //global middleware


app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    identity: req.identity
  });
});

app.use("/subscriptions", subscriptionsRoutes);
app.use("/buy", purchaseRoutes);
app.use("/movies", movieRoutes);
app.use("/play", playbackRoutes);
app.use("/content", contentRoutes);
app.use('/auth', authRoutes);
app.use("/comments", commentsRoutes);
app.use("/likes", likesRoutes);
app.use("/payments", paymentsRoutes);

export default app;