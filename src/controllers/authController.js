const crypto = require('crypto');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const sendEmail = require('../services/sendEmail');
const sendToken = require('../utils/sendToken');
const { send } = require('process');

exports.register = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Email and Password are required.'));
    }

    const userExist = await User.findOne({ email }).lean();

    if (userExist) {
        return next(new ErrorHandler('Email already in use.', 400));
    }

    const newUser = new User({ email, password });
    const token = newUser.getConfirmationEmailToken();
    const user = await newUser.save();
    const confirmationEmailUrl = `${req.protocol}://${req.get('host')}/api/v1/email/confirm/${token}`;
    const message = `Your confirmation email token is as follow:\n\n${confirmationEmailUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmail({
            email,
            subject: 'Confirm Your Email',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${email}`
        });

    } catch (error) {
        user.confirmationEmailToken = undefined;
        user.confirmationEmailTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        next(new ErrorHandler(error.message, 500));
    }
});

exports.confirmEmail = catchAsyncErrors(async (req, res, next) => {
    const confirmationEmailToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        confirmationEmailToken,
        confirmationEmailTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('Confirmation email token invalid or has been expired.', 400));
    }

    user.emailConfirmed = true;
    user.confirmationEmailToken = undefined;
    user.confirmationEmailTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Email and Password are required.'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    if (!user.emailConfirmed) {
        return next(new ErrorHandler('Your email is not confirmed. Please confirm your email!', 400));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Email or password incorrect.'));
    }

    sendToken(user, 200, res);
});