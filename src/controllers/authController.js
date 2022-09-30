const { hash, compare } = require('bcryptjs');
const jwt = require('jsonwebtoken');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');

exports.register = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email }).lean();

    if (userExist) {
        return next(new ErrorHandler('Email already in use.', 400));
    }

    const hashedPassword = await hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    const user = await newUser.save();

    res.status(201).json({
        success: true,
        user
    });
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').lean();

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const isPasswordMatched = await compare(password, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Email or password incorrect.'));
    }

    res.status(200).json({
        success: true,
        user
    });
});