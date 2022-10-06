const Joi = require('joi');

const { objectId, categoryName } = require('./customValidation');

const getCategory = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId)
    })
};

const createCategory = {
    body: Joi.object().keys({
        name: Joi.string().required().custom(categoryName)
    })
};

const deleteCategory = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId)
    })
};

module.exports = {
    getCategory,
    createCategory,
    deleteCategory
};