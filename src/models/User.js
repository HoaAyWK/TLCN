const { compare, hash } = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const { paginate, toJSON } = require('./plugins');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Email must be valid']
    },
    emailConfirmed: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxLength: [100, 'Name must between 2 to 100 characters'],
        minLength: [2, 'Name must between 2 to 100 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
        minLength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        }
    },
    roles: {
        type: [String],
        required: true,
        default: ['freelancer']
    },
    status: {
        type: String,
        required: true,
        default: 'Unactivated',
        enum: {
            values: [
                'Unactivated',
                'Active',
                'Banned',
                'Deleted'
            ]
        }
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        default: 'None'
    },
    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    address: String,
    city: String,
    country: String,
    introduction: String,
    experience: String,
    points: {
        type: Number,
        default: 0.0,
        required: true
    }
}, { timestamps: true });

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.pre('save', async function(next) {
    if (this.password === null || !this.isModified('password')) {
        next();
    }

    this.password = await hash(this.password, 10);
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function(email, excludedUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludedUserId }});
    return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return compare(password, user.password);
};

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;