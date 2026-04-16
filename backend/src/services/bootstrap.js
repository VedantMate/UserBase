const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../config/constants');
const { env } = require('../config/env');

async function seedInitialAdmin() {
  const usersCount = await User.countDocuments({ isDeleted: false });
  if (usersCount > 0) {
    return;
  }

  const admin = new User({
    name: env.seedAdminName,
    email: env.seedAdminEmail,
    password: env.seedAdminPassword,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });

  await admin.save();
  admin.createdBy = admin._id;
  admin.updatedBy = admin._id;
  await admin.save();

  console.log(`[Bootstrap] Seeded admin user: ${admin.email}`);
}

module.exports = { seedInitialAdmin };
