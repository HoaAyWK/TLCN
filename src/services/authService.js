const ApiError = require('../utils/ApiError');
const userService = require('./userService');
const tokenService = require('./tokenService');
const { tokenTypes } = require('../config/tokens');
const { Token } = require('../models');

/**
 * Login with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<User>}
 */

const login = async (email, password) => {
    const user = await userService.getUserWithPasswordByEmail(email);

    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(400, 'Incorrect Email or Password');
    }

    if (!user.emailConfirmed) {
        throw new ApiError(401, 'Your email is not verified. Please verify your email!')
    }

    return user;
};

/**
 * Reset password
 * @param {string} resetPasswordToken 
 * @param {string} newPassword 
 * @returns {Promise<User>}
 */
const resetPassword = async (resetPasswordToken, password, confirmPassword) => {

    if (password !== confirmPassword) {
        throw new ApiError(400, 'Password and ConfirmPassword are not matching');
    }

    try {
        const resetPasswordTokenDoc = await tokenService
            .verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);

        const userId = resetPasswordTokenDoc.user;
        const user = await userService.getUserById(userId);

        if (!user) {
            throw new Error();
        }

        await userService.updateUser(userId, { password });
        await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });

        return user;
    } catch (error) {
        throw new ApiError(401, 'Password reset failed');
    }
};

/**
 * Verify email
 * @param {string} verifyEmailToken 
 * @returns {Promise<User>}
 */
const verifyEmail = async (verifyEmailToken) => {
    try {
        const verifyEmailTokenDoc = await tokenService
            .verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);

        const userId = verifyEmailTokenDoc.user;
        const user = await userService.getUserById(userId);

        if (!user) {
            throw new Error();
        }

        await userService.updateUser(userId, { emailConfirmed: true, status: 'Active' });
        await Token.deleteMany({ user: userId, type: tokenTypes.VERIFY_EMAIL });

        return user;
    } catch (error) {
        console.log(error.message);
        throw new ApiError(401, 'Email verification failed');
    }
};



module.exports = {
    login,
    resetPassword,
    verifyEmail
};