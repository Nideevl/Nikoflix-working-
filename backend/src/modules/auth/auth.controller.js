import bcrypt from 'bcrypt';
import {
  createOtp,
  verifyOtpCode,
  createUser,
  getUserByEmail,
  migrateGuestData,
  forgotPasswordService,
  resetPasswordService
} from './auth.services.js';
import { generateJwt } from '../../utils/jwt.js';

export const signup = async (req, res) => {
  const { email, phone, password } = req.body;

  if (!email && !phone)
    return res.status(400).json({ error: 'Email or phone required' });

  const hashedPassword = await bcrypt.hash(password, 10);
  await createOtp(email, phone, hashedPassword);

  res.json({ message: 'OTP sent' });
};

export const verifyOtp = async (req, res) => {
  const { email, otp, guest_id } = req.body;

  const otpRow = await verifyOtpCode(email, otp);
  if (!otpRow)
    return res.status(400).json({ error: 'Invalid or expired OTP' });

  const user = await createUser(otpRow);

  if (guest_id) {
    await migrateGuestData(guest_id, user.user_id);
  }

  const token = generateJwt(user.user_id);
  res.json({ token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user)
    return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok)
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateJwt(user.user_id);
  res.json({ token });
};


export const logout = (req, res) => {
  res.json({ message: 'Logged out' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    await forgotPasswordService(email);

    res.json({ message: 'If user exists, OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    await resetPasswordService(email, otp, newPassword);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

