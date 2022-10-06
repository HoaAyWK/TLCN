const ApiError = require('../utils/ApiError');
const Joi = require('joi');
const pick = require('../utils/pick');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['parmas', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details
            .map((details) => details.message)
            .join(', ');
        
        return next(new ApiError(400, errorMessage));
    }

    Object.assign(req, value);

    next();
};

module.exports = validate;