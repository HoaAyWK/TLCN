const crypto = require('crypto');
const { compare, hash } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');

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
    firstName: {
        type: String,
        required: false,
        maxLength: [100, 'First name must not be logger than 100 characters']
    },
    lastName: {
        type: String,
        required: false,
        maxLength: [100, 'Last name must not be logger than 100 characters']
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
    confirmationEmailToken: {
        type: String,
        select: false
    },
    confirmationEmailTokenExpire: {
        type: Date,
        select: false
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    },
    offers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Job',
        default: []
    },
    jobTakens: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Job',
        default: []
    },
    points: {
        type: Number,
        default: 0.0,
        required: true
    }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.password === null || !this.isModified('password')) {
        next();
    }

    this.password = await hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function() {
    return jwt.sign(
        { 
            id: this._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_TIME
        }
    );
};

userSchema.methods.getConfirmationEmailToken = function() {
    const token = crypto.randomBytes(20).toString('hex');
    this.confirmationEmailToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    this.confirmationEmailTokenExpire = Date.now() + 30 * 60 * 1000;

    return token;
};

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);