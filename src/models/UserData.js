const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    points: {
        type: Number,
        required: true,
        default: 0.0
    }
});


module.exports = mongoose.model('UserData', userDataSchema);