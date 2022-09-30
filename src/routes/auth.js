const { Router } = require('express');

const {
    register,
    login,
    confirmEmail
} = require('../controllers/authController');

const router = Router();

router.post('/register', register);
router.post('/login', login)
router.get('/email/confirm/:token', confirmEmail);

module.exports = router;