const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        require: [true, 'Title is required']
    },
    description: {
        type: String,
        require: [true, 'Description is required']
    },
    file: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        }
    },
    closeTime: {
        type: Number,
        required: [true, 'CloseTime is required'],
        default: 1
    },
    duration: {
        type: Number,
        required: [true, 'CloseTime is required']
    },
    price: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Open',
        enum: {
            values: [
                'Open',
                'Processing',
                'Closed',
                'Canceled',
                'Expired'
            ]
        }
    },
    requests: [
        {
            freelancer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            message: {
                type: String,
                required: true
            },
            offer: {
                type: Number,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('Job', jobSchema);