const { compare, hash } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: () => this.provider !== 'email' ? false : [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Email must be valid.']
    },
    provider: {
        type: String,
        required: true,
        default: 'email'
    },
    gooleId: {
        type: String
    },
    emailConfirmed: {
        type: Boolean,
        default: this.provider !== 'email' ? false : true
    },
    firstName: {
        type: String,
        required: false,
        maxLength: [100, 'First name must not be logger than 100 characters.']
    },
    lastName: {
        type: String,
        required: false,
        maxLength: [100, 'Last name must not be logger than 100 characters.']
    },
    password: {
        type: String,
        required: () => this.provider !== 'email' ? false : [true, 'Password is required.'],
        select: false,
        minLength: [6, 'Password must be at least 6 characters.']
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
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.password === null || !this.isModified('password')) {
        next();
    }

    this.password = await hash(this.password, 10);
})

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

module.exports = mongoose.model('User', userSchema);