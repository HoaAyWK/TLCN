const Joi = require('joi');

const { password, username } = require('./customValidation');

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        name: Joi.string().required().custom(username),
        phone: Joi.string().required()
    })
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    })
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().required().email()
    })
};

const resetPassword = {
    params: Joi.object().keys({
        token: Joi.string().required()
    }),
    body: {
        password: Joi.string().required().custom(password),
        confirmPassword: Joi.string().required()
    }
};

const verifyEmail = {
    params: Joi.object().keys({
        token: Joi.string().required()
    })
};

module.exports = {
    register,
    login,
    forgotPassword,
    verifyEmail,
    resetPassword
};