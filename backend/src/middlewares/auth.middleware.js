//auth.middleware.js

import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export const identityMiddleware = (req, res, next) => {
  // 1️⃣ Logged-in user (JWT)
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.identity = { type: 'user', user_id: decoded.user_id };
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // 2️⃣ Guest via cookie (PERSISTENT)
  let guestId = req.cookies?.guest_id;

  if (!guestId) {
    // 3️⃣ First-ever visit → create ONCE
    guestId = uuid();

    res.cookie('guest_id', guestId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in production (https)
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });
  }

  req.identity = { type: 'guest', guest_id: guestId };
  next();
};
