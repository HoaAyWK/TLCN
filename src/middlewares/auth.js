const jwt = require('jsonwebtoken');

const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('./catchAsyncErrors');
const config = require('../config/config');
const { userService } = require('../services');

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ApiError(401, 'You are not logged in'));
    }

    const { sub } = jwt.verify(token.token, config.jwt.secret);
    const user = await userService.getUserById(sub);

    req.user = user;
    next();
});

exports.authorizeRoles = (...roles) => {
    if (roles.length === 1) {
        return (req, res, next) => {
            if (!req.user.roles.includes(roles[0])) {
                return next(new ApiError(403, 'You do not have permission to access this resource'));
            }

            return next();
        }
    } else {
        return (req, res, next) => {
            for (let r of roles) {
                if (req.user.roles.includes(r)) {
                    return next();
                }
            }
    
            return next(new ApiError(403, 'You do not have permission to access this resource.'));
        }
    }
}