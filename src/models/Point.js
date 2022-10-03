const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        unique: true
    },
    description: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required.']
    }
});

module.exports = mongoose.model('Point', pointSchema);