const Joi = require('joi');
const { objectId, password, username } = require('./customValidation');

const getUser = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId)
    })
};

const banUser = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId)
    })
};

const deleteUser = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId)
    })
};

const changePassword = {
    body: Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required().custom(password)
    })
};

module.exports = {
    getUser,
    banUser,
    deleteUser,
    changePassword
};