const mongoose = require('mongoose');

const { tokenTypes } = require('../config/tokens');
const { toJSON } = require('./plugins');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: [
            tokenTypes.REFRESH,
            tokenTypes.VERIFY_EMAIL,
            tokenTypes.RESET_PASSWORD
        ]
    },
    expires: {
        type: Date,
        required: true
    }
}, { timestamps: true });

tokenSchema.plugin(toJSON);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;