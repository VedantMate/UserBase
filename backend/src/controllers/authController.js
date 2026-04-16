const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../config/constants');
const { signAccessToken } = require('../services/tokenService');

async function register(req, res, next) {
  try {
    const { name, email, username, password } = req.body;

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
      role: ROLES.USER,
      status: USER_STATUS.ACTIVE,
      createdBy: null,
      updatedBy: null,
    });

    user.createdBy = user._id;
    user.updatedBy = user._id;
    await user.save();

    const token = signAccessToken(user);

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const normalizedIdentifier = identifier.trim().toLowerCase();

    const query = {
      isDeleted: false,
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    };

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({ message: 'Your account is inactive.' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signAccessToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
};
