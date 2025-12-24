import { query } from '../../config/db.js';
import bcrypt from 'bcrypt';

export const createOtp = async (email, phone, password_hash) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await query(
    `
    INSERT INTO otp_verifications
    (otp_id, otp_code, expires_at, verified, email, phone, password_hash)
    VALUES (gen_random_uuid(), $1, NOW() + INTERVAL '5 minutes', false, $2, $3, $4)
    `,
    [otp, email, phone, password_hash]
  );

  console.log('OTP (mock):', otp);
};

export const verifyOtpCode = async (email, otp) => {
  const { rows } = await query(
    `
    SELECT * FROM otp_verifications
    WHERE otp_code = $1
      AND email = $2
      AND verified = false
      AND expires_at > NOW()
    `,
    [otp, email]
  );

  return rows[0];
};

export const createUser = async (otpRow) => {
  const { rows } = await query(
    `
    INSERT INTO users (email, phone_number, password_hash, is_verified)
    VALUES ($1, $2, $3, true)
    RETURNING *
    `,
    [otpRow.email, otpRow.phone, otpRow.password_hash]
  );

  await query(
    `
    UPDATE otp_verifications
    SET verified = true
    WHERE otp_id = $1
    `,
    [otpRow.otp_id]
  );

  return rows[0];
};

export const getUserByEmail = async (email) => {
  const { rows } = await query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return rows[0];
};

export const migrateGuestData = async (guest_id, user_id) => {
  await query(
    `
    UPDATE watch_history
    SET user_id = $1, guest_id = NULL
    WHERE guest_id = $2
    `,
    [user_id, guest_id]
  );

  await query(
    `
    UPDATE likes
    SET user_id = $1, guest_id = NULL
    WHERE guest_id = $2
    `,
    [user_id, guest_id]
  );
};

export const forgotPasswordService = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) return;

  await createOtp(email, null, null, 'PASSWORD_RESET');
};

export const resetPasswordService = async (email, otp, newPassword) => {
  const otpRow = await verifyOtpCode(email, otp);
  if (!otpRow) throw new Error('Invalid OTP');

  const hash = await bcrypt.hash(newPassword, 10);

  await query(
    `UPDATE users SET password_hash = $1 WHERE email = $2`,
    [hash, email]
  );
};
