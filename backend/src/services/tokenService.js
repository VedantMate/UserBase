const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = {
  signAccessToken,
};
