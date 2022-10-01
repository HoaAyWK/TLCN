const User = require('../models/User');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');


exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({}, 
            '_id firstName lastName email status emailConfirmed roles avatar')
        .lean();

    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(
            req.params.id,
            '_id firstName lastName email status emailConfirmed roles avatar')
        .lean();

    if (!user) {
        return next(new ErrorHandler('User not found.', 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

exports.banUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found.', 404));
    }

    user.status = 'Banned';
    const savedUser = await user
        .save({ validateBeforeSave: false })
        .select('_id firstName lastName email status emailConfirmed roles avatar')
        .lean();
    
    res.status(200).json({
        success: true,
        user: savedUser
    });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found.', 404));
    }

    user.status = 'Deleted';
    const savedUser = await user
        .save({ validateBeforeSave: false })
        .select('_id firstName lastName email status emailConfirmed roles avatar')
        .lean();
    
    res.status(200).json({
        success: true,
        user: savedUser
    });
});