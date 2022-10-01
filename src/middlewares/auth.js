const jwt = require('jsonwebtoken');

const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(createError(401, 'You are not logged in.'));
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(id).lean();
    req.user = user;
    next();
});

exports.authorizeRoles = (...roles) => {
    if (roles.length === 1) {
        return (req, res, next) => {
            if (!req.user.roles.includes(roles[0])) {
                return next(new ErrorHandler('You do not have permission to access this resource.', 403));
            }

            return next();
        }
    } else {
        for (let r of roles) {
            if (req.user.roles.includes(r)) {
                return next();
            }
        }

        return next(new ErrorHandler('You do not have permission to access this resource.', 403));
    }
}