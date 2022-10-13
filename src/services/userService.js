const cloudinary = require('cloudinary');

const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const create = async (userBody) => {
    if (!userBody.email) {
        throw new ApiError(400, 'Email is required');
    }

    if (!userBody.password) {
        throw new ApiError('Pa400, ssword is required');
    }

    if (!userBody.phone) {
        throw new ApiError(400, 'Phone is required');
    }

    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError('E400, mail already taken');
    }

    return User.create(userBody);
};

const queryUsers = async (filter, options) => {
    const users = await User.paginate(filter, options);
    
    return users;
};

const getUserById = async (id) => {
    return User.findById(id).select('-points -jobTakens -offers');
};

const getUserWithAllInfo = async (id) => {
    return User.findById(id);
};

const getUserWithPasswordById = async (id) => {
    return User.findById(id).select('+password');
};

const getUserDetails = async (id) => {
    return User.findById(id);
};

const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

const getUserWithPasswordByEmail = async (email) => {
    return User.findOne({ email }).select('+password');
};

const changeUserStatus = async (id, status) => {
    const user = await User.findById(id).select('-points -jobTakens -offers');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.status = status;
    await user.save({ validateBeforeSave: false });
    
    return user;
};

const changePassword = async (id, oldPassword, newPassword) => {

    const user = await User.findById(id).select('+password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordMatching = await user.isPasswordMatch(oldPassword);

    if (!isPasswordMatching) {
        throw new ApiError(400, 'Wrong password!');
    }

    user.password = newPassword;
    await user.save();

    return user;
};

const purchasePoints = async (id, points) => {
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.points = user.points + points;
    await user.save();

    return user;
};

const updateUserById = async (id, updateBody) => {
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (updateBody.email && (await User.isEmailTaken(updateBody.email, id))) {
        throw new ApiError(400, 'Email already taken');
    }

    const newUserData = {
        email: updateBody.email,
        name: updateBody.name,
        phone: updateBody.phone
    };

    if (updateBody.avatar) {
        if (user.avatar.public_id) {
            const image_id = user.avatar.public_id;
            await cloudinary.v2.uploader.destroy(image_id);
        }
        
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

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: newUserData },
        { 
            new: true,
            runValidators: true
        }
    )
    .lean();

    return updatedUser;
};

const deleteUser = async (id) => {
    const user = await user.findById(id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    await user.remove();
    return user;
};

const getCommentsByUserId = async (userId) => {
    const user = await User.findById(userId);

    return user.comments;
};

module.exports = {
    create,
    queryUsers,
    getUserByEmail,
    getUserWithPasswordByEmail,
    getUserWithAllInfo,
    getUserById,
    getUserWithPasswordById,
    getUserDetails,
    purchasePoints,
    changeUserStatus,
    changePassword,
    updateUserById,
    deleteUser,
    getCommentsByUserId
};