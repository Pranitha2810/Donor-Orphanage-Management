// middleware/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment");
  process.exit(1);
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token missing', status: 401 });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload should include { userId, email, role }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid token', status: 403 });
  }
};

const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthenticated', status: 401 });
  }
  if (!Array.isArray(roles)) roles = [roles];
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized - insufficient role', status: 403 });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole
};
