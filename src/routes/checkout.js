const { Router } = require('express');

const checkoutController = require('../controllers/checkoutController');
const { isAuthenticated } = require('../middlewares/auth');

const router = Router();

router.post('/checkout', isAuthenticated, checkoutController.checkoutWithStripe);
router.get('/checkout/success', checkoutController.checkoutSuccess);
router.get('/checkout/cancel', checkoutController.checkoutCancel);

module.exports = router;