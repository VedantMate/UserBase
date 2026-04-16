const crypto = require('crypto');
const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../config/constants');

function canAccessUser(currentUser, targetUser) {
  if (!targetUser || targetUser.isDeleted) {
    return false;
  }

  if (currentUser.role === ROLES.ADMIN) {
    return true;
  }

  if (currentUser.role === ROLES.MANAGER) {
    return targetUser.role !== ROLES.ADMIN;
  }

  return String(currentUser._id) === String(targetUser._id);
}

function buildListFilter(query) {
  const filter = { isDeleted: false };

  if (query.role) {
    filter.role = query.role;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { username: regex }];
  }

  return filter;
}

async function listUsers(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const filter = buildListFilter(req.query);

    if (req.user.role === ROLES.MANAGER) {
      filter.role = { $ne: ROLES.ADMIN };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      data: users.map((user) => user.toSafeObject()),
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const target = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!target || target.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!canAccessUser(req.user, target)) {
      return res.status(403).json({ message: 'You are not allowed to view this user.' });
    }

    return res.json(target.toSafeObject());
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, username, role, status } = req.body;
    const autoPassword = crypto.randomBytes(8).toString('base64url');
    const password = req.body.password || autoPassword;

    const existingEmail = await User.findOne({ email, isDeleted: false });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase(), isDeleted: false });
      if (existingUsername) {
        return res.status(409).json({ message: 'Username is already in use.' });
      }
    }

    const user = await User.create({
      name,
      email,
      username: username ? username.toLowerCase() : undefined,
      password,
      role,
      status: status || USER_STATUS.ACTIVE,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({
      message: 'User created successfully.',
      generatedPassword: req.body.password ? undefined : autoPassword,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id).select('+password');
    if (!target || target.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!canAccessUser(req.user, target)) {
      return res.status(403).json({ message: 'You are not allowed to update this user.' });
    }

    if (req.user.role === ROLES.USER && String(req.user._id) !== String(target._id)) {
      return res.status(403).json({ message: 'Users can only update their own profile.' });
    }

    const updates = {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
      status: req.body.status,
    };

    if (req.user.role === ROLES.MANAGER) {
      delete updates.role;
      if (target.role === ROLES.ADMIN) {
        return res.status(403).json({ message: 'Manager cannot update admin users.' });
      }
    }

    if (req.user.role === ROLES.USER) {
      delete updates.role;
      delete updates.status;
      delete updates.email;
      delete updates.username;
    }

    if (updates.email && updates.email !== target.email) {
      const existingEmail = await User.findOne({ email: updates.email, _id: { $ne: target._id }, isDeleted: false });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email is already in use.' });
      }
    }

    if (updates.username && updates.username !== target.username) {
      const normalizedUsername = updates.username.toLowerCase();
      const existingUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: target._id },
        isDeleted: false,
      });
      if (existingUsername) {
        return res.status(409).json({ message: 'Username is already in use.' });
      }
      updates.username = normalizedUsername;
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        target[key] = value;
      }
    });
    target.updatedBy = req.user._id;
    await target.save();

    return res.json({
      message: 'User updated successfully.',
      user: target.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target || target.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Admin cannot deactivate themselves.' });
    }

    target.isDeleted = true;
    target.status = USER_STATUS.INACTIVE;
    target.updatedBy = req.user._id;
    await target.save();

    return res.json({
      message: 'User deactivated successfully.',
      user: target.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user.toSafeObject());
  } catch (error) {
    return next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.password !== undefined) {
      user.password = req.body.password;
    }

    user.updatedBy = req.user._id;
    await user.save();

    return res.json({
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getMyProfile,
  updateMyProfile,
};
