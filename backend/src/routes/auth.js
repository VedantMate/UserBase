const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateRequest } = require('../middleware/validate');
const { loginValidation, registerValidation } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

module.exports = router;
