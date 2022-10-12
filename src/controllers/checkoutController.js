const { checkoutService } = require('../services');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const checkoutWithStripe = catchAsyncErrors(async (req, res, next) => {
    const session = await checkoutService.checkoutWithStripe(req.user.id, req.body.items);
    
    res.status(200).json({
        success: true,
        session
    });
});

const checkoutWebhook = catchAsyncErrors(async (req, res, next) => {
    await checkoutService.webhook(req);
    console.log('receive webhook event');

    res.status(200).json({
        message: 'receive wehook event'
    });
});

const checkoutSuccess = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Checkout success'
    });
});

const checkoutCancel = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Checkout cancel'
    });
});

module.exports = {
    checkoutWithStripe,
    checkoutWebhook,
    checkoutSuccess,
    checkoutCancel
};