const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select('-password');

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is inactive.' });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
}

module.exports = {
  requireAuth,
};
