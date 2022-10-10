const Joi = require('joi');

const { objectId } = require('./customValidation');

const createJob = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        minPrice: Joi.number().required(),
        maxPrice: Joi.number().required(),
        category: Joi.required().custom(objectId),
        closeTime: Joi.number().required(),
        duration: Joi.number().required()
    })
};

module.exports = {
    createJob
};