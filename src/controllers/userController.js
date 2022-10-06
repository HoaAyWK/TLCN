const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const pick = require('../utils/pick');
const sendToken = require('../utils/sendToken');
const { userService, tokenService } = require('../services');
const { userStatus } = require('../config/userStatus');


const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const filter = pick(req.query, ['name', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await userService.queryUsers(filter, options);

    res.status(200).json({
        success: true,
        ...result
    });
});

const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
        return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
        success: true,
        user
    });
});

const banUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userService
        .changeUserStatus(req.params.id, userStatus.BANNED);
    
    res.status(200).json({
        success: true,
        user
    });
});

const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userService
        .changeUserStatus(req.params.id, userStatus.DELETED);
    
    res.status(200).json({
        success: true,
        user
    });
});

const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await userService.getUserDetails(req.user.id);

    if (!user) {
        return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
        success: true,
        user
    });
});

const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await userService.updateUserById(req.user.id, req.body);

    res.status(200).json({
        success: true,
        user
    });
});

const changePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    const user = await userService.changePassword(req.user.id, oldPassword, newPassword);
    const accessToken = tokenService.generateAuthToken(user);

    sendToken(user, accessToken, 200, res);
});

const deleteMyAccount = catchAsyncErrors(async (req, res, next) => {
    const user =  await userService.changeUserStatus(req.user.id, userStatus.DELETED);
    
    if (user) {
        return res.status(200).json({
            success: true,
            user: 'Deleted account'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Threre is an error when deleting user'
    });
});

module.exports = {
    getAllUsers,
    getUser,
    getUserProfile,
    changePassword,
    updateUserProfile,
    banUser,
    deleteUser,
    deleteMyAccount,
};