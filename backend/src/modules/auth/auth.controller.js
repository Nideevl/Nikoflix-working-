import bcrypt from 'bcrypt';
import { query } from '../../config/db.js'
import {
  createOtp,
  verifyOtpCode,
  findUserByIdentifier,
  forgotPasswordService,
  resetPasswordService
} from './auth.services.js';
import { generateJwt } from '../../utils/jwt.js';

export const signup = async (req, res) => {
  const { username, email, phone } = req.body;
   if (!username) return res.status(400).json({ error: "Username required" });

  const { rowCount } = await query(
    `SELECT 1 FROM users WHERE username = $1`,
    [username]
  );

  if (rowCount > 0) {
    return res.status(400).json({ error: "Username already taken" });
  }
  if (!email && !phone) return res.status(400).json({ error: "Email or phone required" });

  await createOtp(username, email, phone);

  res.json({ message: 'OTP sent' });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const otpRow = await verifyOtpCode(email, otp);

  if (!otpRow) return res.status(400).json({ error: "Invalid OTP" });

  await query(
    `UPDATE otp_verifications SET verified = true WHERE otp_id = $1`,
    [otpRow.otp_id]
  );

  res.json({ message: "OTP verified" });
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  const user = await findUserByIdentifier(identifier);
  if (!user) return res.status(400).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: "Wrong password" });

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

export const checkUsername = async (req, res) => {
  const { username } = req.query;

  console.log("hi ",username);

  if (!username) {
    return res.status(400).json({ available: false });
  }

  const { rowCount } = await query(
    `SELECT 1 FROM users WHERE username = $1`,
    [username]
  );

  res.json({ available: rowCount === 0 });
};

export const setPassword = async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query(
    `SELECT * FROM otp_verifications WHERE email = $1 AND verified = true`,
    [email]
  );

  const otpRow = rows[0];
  if (!otpRow) return res.status(400).json({ error: "OTP not verified" });

  const hash = await bcrypt.hash(password, 10);

  const { rows: userRows } = await query(
    `
    INSERT INTO users (username, email, phone_number, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [otpRow.username, otpRow.email, otpRow.phone, hash]
  );

  // ✅ delete OTP row (important)
  await query(`DELETE FROM otp_verifications WHERE otp_id = $1`, [otpRow.otp_id]);

  res.json({ message: "Account created", user: userRows[0] });
};