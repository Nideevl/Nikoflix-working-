import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import { identityMiddleware } from './middlewares/auth.middleware.js';
import commentsRoutes from "./modules/comments/comments.routes.js";

const app = express(); // new Express application instance

app.use(express.json()); // Automatically parses incoming JSON request bodies
app.use(identityMiddleware); // Global middleware

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    identity: req.identity
  });
});


app.use('/auth', authRoutes);
app.use("/comments", commentsRoutes);

export default app;
