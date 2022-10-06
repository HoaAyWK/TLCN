const mongoose = require('mongoose');

const { toJSON } = require('./plugins');

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

pointSchema.plugin(toJSON);

/**
 * @typedef Point
 */
const Point = mongoose.model('Point', pointSchema);

module.exports = Point;