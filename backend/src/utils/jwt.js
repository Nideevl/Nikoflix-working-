import jwt from 'jsonwebtoken';

export const generateJwt = (user_id) => {
  return jwt.sign(
    { user_id },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
};
