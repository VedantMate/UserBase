const { body, param, query } = require('express-validator');
const { ROLES, USER_STATUS } = require('../config/constants');

const objectIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid user id.'),
];

const createUserValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters.')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, underscore, dot, and hyphen.'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must include upper, lower, and numeric characters.'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role.'),
  body('status').optional().isIn(Object.values(USER_STATUS)).withMessage('Invalid status.'),
];

const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').optional().trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters.')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, underscore, dot, and hyphen.'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must include upper, lower, and numeric characters.'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role.'),
  body('status').optional().isIn(Object.values(USER_STATUS)).withMessage('Invalid status.'),
];

const listUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be at least 1.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100.'),
  query('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role filter.'),
  query('status').optional().isIn(Object.values(USER_STATUS)).withMessage('Invalid status filter.'),
  query('search').optional().trim().isLength({ max: 120 }).withMessage('Search is too long.'),
];

const updateMyProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must include upper, lower, and numeric characters.'),
];

module.exports = {
  objectIdParamValidation,
  createUserValidation,
  updateUserValidation,
  listUsersValidation,
  updateMyProfileValidation,
};
