import jwt from "jsonwebtoken";

export const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Admin token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    req.admin = true;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid admin token" });
  }
};
