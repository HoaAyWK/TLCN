const crypto = require('crypto');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const UserData = require('../models/UserData');
const sendEmail = require('../services/sendEmail');
const sendToken = require('../utils/sendToken');

exports.register = catchAsyncErrors(async (req, res, next) => {
    const { email, password, phone } = req.body;

    if (!email || !password || !phone) {
        return next(new ErrorHandler('Email, Phone, and Password are required'));
    }

    const userExist = await User.findOne({ email }).lean();

    if (userExist) {
        return next(new ErrorHandler('Email already in use', 400));
    }

    const newUser = new User({ email, password, phone });
    const userData = new UserData({ user: newUser._id });
    const token = newUser.getConfirmationEmailToken();

    const user = await newUser.save();
    await userData.save();

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
    }).select('+confirmationEmailToken +confirmationEmailTokenExpire');

    if (!user) {
        return next(new ErrorHandler('Confirmation email token invalid or has been expired', 400));
    }

    user.status = 'Active';
    user.emailConfirmed = true;
    user.confirmationEmailToken = undefined;
    user.confirmationEmailTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Email and Password are required'));
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
        return next(new ErrorHandler('Email or password incorrect'));
    }

    sendToken(user, 200, res);
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler('Please enter email!', 400));
    }

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
    
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    console.log(user);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Frl password recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        next(new ErrorHandler(error.message, 500));
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
        return next(new ErrorHandler('Password reset token invalid or has been expired.', 400));
    }

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return next(new ErrorHandler('Password does not match.', 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
});