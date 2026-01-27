import express from 'express';
import {
  signup,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkUsername,
  setPassword
} from './auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/check-username', checkUsername);
router.post("/set-password", setPassword);

export default router;
