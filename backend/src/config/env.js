const dotenv = require('dotenv');
const path = require('path');

const backendRoot = path.resolve(__dirname, '../..');
dotenv.config({
  path: [
    path.join(backendRoot, '.env.local'),
    path.join(backendRoot, '.env'),
  ],
});

function parseOrigins(value) {
  if (!value) {
    return ['http://localhost:5173'];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireEnv(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3001),
  mongoUri: requireEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/user_management_system'),
  mongoUriFallback: process.env.MONGODB_URI_FALLBACK || '',
  jwtSecret: requireEnv('JWT_SECRET', 'change_me_in_production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigins: parseOrigins(process.env.FRONTEND_URL),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  seedAdminName: process.env.SEED_ADMIN_NAME || 'System Admin',
};

module.exports = { env };
