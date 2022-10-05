const { Router } = require('express');

const authController = require('../controllers/authController');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login)
router.get('/email/confirm/:token', authController.confirmEmail);
router.post('/password/forgot', authController.forgotPassword);
router.put('/password/reset/:token', authController.resetPassword);
router.get('/logout', authController.logout);

module.exports = router;