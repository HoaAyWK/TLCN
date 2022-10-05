const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');

const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { Token } = require('../models');
const { tokenTypes } = require('../config/tokens');
const userService = require('./userService');

/**
 * Generate token
 * @param {ObjectId} userId 
 * @param {Moment} expires 
 * @param {string} type 
 * @param {string} secret 
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type
    };

    return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token 
 * @param {ObjectId} userId 
 * @param {Moment} expires 
 * @param {string} type 
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type
    });

    return tokenDoc;
};


/**
 * Verify token and return token (or throw an error if it is not valid)
 * @param {string} token 
 * @param {string} type 
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({ token, type, user: payload.sub }).lean();

    if (!tokenDoc) {
        throw new ApiError(404, 'Token not found');
    }

    return tokenDoc;
};

/**
 * Generate auth token
 * @param {User} user 
 * @returns {Promise<Token>}
 */
const generateAuthToken = (user) => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationDays, 'days');
    const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

    return {
        token: accessToken,
        expires: accessTokenExpires.toDate()
    };
};

/**
 * Generate reset password token
 * @param {string} email 
 * @returns {Promise<Token>}
 */
const generateResetPasswordToken = async (email) => {
    if (!email) {
        throw new ApiError(400, 'Email is required');
    }

    const user = await userService.getUserByEmail(email);
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);

    await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);

    return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user 
 * @returns 
 */
const generateVerifyEmailToken = async (user) => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);

    await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);

    return verifyEmailToken;
};

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthToken,
    generateResetPasswordToken,
    generateVerifyEmailToken
};