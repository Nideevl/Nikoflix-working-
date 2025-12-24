import express from 'express';
import {
  signup,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  resetPassword
} from './auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
