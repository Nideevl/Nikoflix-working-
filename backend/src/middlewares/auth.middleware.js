import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export const identityMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const guestId = req.headers['x-guest-id'];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.identity = { type: 'user', user_id: decoded.user_id };
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  if (guestId) {
    req.identity = { type: 'guest', guest_id: guestId };
    return next();
  }

  // Create new guest
  const newGuestId = uuid();
  req.identity = { type: 'guest', guest_id: newGuestId };
  res.setHeader('X-Guest-Id', newGuestId);
  next();
};
