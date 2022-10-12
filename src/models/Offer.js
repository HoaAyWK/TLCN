const mongoose = require('mongoose');

const { toJSON } = require('./plugins');

const offerSchema = new mongoose.Schema({
    freelancer: {
        required: [true, 'Freelancer is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    job: {
        required: [true, 'Job is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    isAccepted: {
        type: Boolean,
        default: false,
        required: true
    }
});

offerSchema.plugin(toJSON);

/**
 * @typedef Offer
 */
const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;