const { hash, compare } = require('bcryptjs');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const sendToken = require('../utils/sendToken');

exports.register = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Email and Password are required.'));
    }

    const userExist = await User.findOne({ email }).lean();

    if (userExist) {
        return next(new ErrorHandler('Email already in use.', 400));
    }

    const hashedPassword = await hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    const user = await newUser.save();

    sendToken(user, 200, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Email and Password are required.'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const isPasswordMatched = await compare(password, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Email or password incorrect.'));
    }

    sendToken(user, 200, res);
});