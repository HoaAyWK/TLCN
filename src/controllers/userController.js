const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const sendToken = require('../utils/sendToken');


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

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler('Your are not logged in', 400));
    }

    const user = await User.findById(req.user._id,
            '_id firstName lastName email status emailConfirmed roles avatar')
        .lean();
    
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const newUserData = {
        email: req.body.email,
        name: req.body.name,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };

    if (req.body.avatar) {
        const user = await User.findById(userId);
        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatar',
            width: 150,
            crop: "scale"
        });

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }
    
    const user = await User.findByIdAndUpdate(
            userId,
            { $set: newUserData },
            { 
                new: true,
                runValidators: true
            }
        )
        .select('_id firstName lastName email emailConfirmed status roles avatar')
        .lean();

    res.status(200).json({
        success: true,
        user
    });
});

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return next(createError(400, 'Old Password and New Password are required.'));
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return next(createError(404, 'User not found.'));
    }

    const isPasswordMatching = await user.comparePassword(oldPassword);

    if (!isPasswordMatching) {
        return next(createError(400, 'Wrong password!'));
    }

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
});

exports.deleteMyAccount = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler('User not found.', 404));
    }

    user.status = 'Deleted';
    await user.save({ validateBeforeSave: false })
    
    res.status(200).json({
        success: true,
        user: 'Deleted account.'
    });
});