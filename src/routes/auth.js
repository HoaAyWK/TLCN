const { Router } = require('express');

const authController = require('../controllers/authController');
const { authValidation } = require('../validations');
const validate = require('../middlewares/validate');

const router = Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login)
router.get('/email/confirm/:token', validate(authValidation.verifyEmail), authController.confirmEmail);
router.post('/password/forgot', validate(authValidation.forgotPassword), authController.forgotPassword);
router.put('/password/reset/:token', validate(authValidation.resetPassword), authController.resetPassword);
router.get('/logout', authController.logout);

module.exports = router;