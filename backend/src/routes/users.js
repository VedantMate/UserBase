const express = require('express');
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validateRequest } = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const {
  createUserValidation,
  listUsersValidation,
  objectIdParamValidation,
  updateMyProfileValidation,
  updateUserValidation,
} = require('../validators/userValidator');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfileValidation, validateRequest, updateMyProfile);

router.get('/', requireRole(ROLES.ADMIN, ROLES.MANAGER), listUsersValidation, validateRequest, listUsers);
router.get('/:id', objectIdParamValidation, validateRequest, getUserById);
router.post('/', requireRole(ROLES.ADMIN), createUserValidation, validateRequest, createUser);
router.patch('/:id', objectIdParamValidation, updateUserValidation, validateRequest, updateUser);
router.delete('/:id', requireRole(ROLES.ADMIN), objectIdParamValidation, validateRequest, deactivateUser);

module.exports = router;
