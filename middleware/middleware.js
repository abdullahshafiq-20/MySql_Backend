import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // Check if user is authenticated via Google
  if (req.isAuthenticated()) {
    return next();
  }

  // If not authenticated via Google, check for JWT
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};