const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/sendToken');
const { 
    authService,
    tokenService,
    userService,
    sendEmailService
} = require('../services');

const register = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const user = await userService.create(req.body);
    const token = await tokenService.generateVerifyEmailToken(user);

    const confirmationEmailUrl = `${req.protocol}://${req.get('host')}/api/v1/email/confirm/${token}`;
    const message = `Your confirmation email token is as follow:\n\n${confirmationEmailUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmailService.sendEmail({
            email,
            subject: 'Confirm Your Email',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${email}`
        });

    } catch (error) {
        next(new ApiError(500, error.message));
    }
});

const confirmEmail = catchAsyncErrors(async (req, res, next) => {
    const user = await authService.verifyEmail(req.params.token);
    const accessToken = tokenService.generateAuthToken(user);

    sendToken(user, accessToken, 200, res);
});

const login = catchAsyncErrors(async (req, res, next) => {
    const user = await authService.login(req.body.email, req.body.password);
    const accessToken = tokenService.generateAuthToken(user);
    const { password, ...userDetails } = user._doc;

    sendToken(userDetails, accessToken, 200, res);
});

const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const resetToken = await tokenService.generateResetPasswordToken(email);
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmailService.sendEmail({
            email,
            subject: 'Frl password recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${email}`
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
});

const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await authService.resetPassword(
        req.params.token,
        req.body.password,
        req.body.confirmPassword
    );

    const accessToken = tokenService.generateAuthToken(user);

    sendToken(user, accessToken, 200, res);
});

const logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
});

module.exports = {
    login,
    register,
    forgotPassword,
    resetPassword,
    confirmEmail,
    logout
};