const { Router } = require('express');

const {
    register,
    login,
    confirmEmail,
    forgotPassword,
    resetPassword,
    logout
} = require('../controllers/authController');

const router = Router();

router.post('/register', register);
router.post('/login', login)
router.get('/email/confirm/:token', confirmEmail);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.get('/logout', logout);

module.exports = router;