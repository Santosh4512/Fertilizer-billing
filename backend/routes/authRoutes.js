const express = require('express');
const router = express.Router();
const { authUser, registerUser, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/change-password', protect, changePassword);

module.exports = router;
