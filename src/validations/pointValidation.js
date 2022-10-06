const Joi = require('joi');

const { objectId } = require('./customValidation');

const createPoint = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        amount: Joi.number().required()
    })
};

const getPoint = {
    params: Joi.object().keys({
        id: Joi.required().custom(objectId)
    })
};

const deletePoint = {
    params: Joi.object().keys({
        id: Joi.required().custom(objectId)
    })
};

module.exports = {
    createPoint,
    getPoint,
    deletePoint
};