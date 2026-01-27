import jwt from 'jsonwebtoken';

export const generateJwt = (user_id) => {
  return jwt.sign(
    { user_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateAdminJwt = (admin_id) => {
  return jwt.sign(
    { admin_id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
};