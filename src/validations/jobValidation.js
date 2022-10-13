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

const addComment = {
    params: Joi.object().keys({
        id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
        partnerId: Joi.required().custom(objectId),
        rating: Joi.number().required(),
        content: Joi.string().required()
    })
};

const deleteComment = {
    params: Joi.object().keys({
        id: Joi.required().custom(objectId)
    }),
    query: Joi.object().keys({
        partner: Joi.required().custom(objectId)
    })
};

module.exports = {
    createJob,
    addComment,
    deleteComment
};