const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            name: { 
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            quantity:{
                type: Number,
                default: 1,
                required: true
            }
        }   
    ],
    status: {
        type: String,
        default: 'Pending',
        enum: {
            values: [
                'Pending',
                'Cancel',
                'Success'
            ]
        },
        required: true
    },
    method: {
        type: String,
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;