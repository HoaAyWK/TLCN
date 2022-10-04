const mongoose = require('mongoose');


const requestSchema = new mongoose.Schema({
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
    },
    selected: {
        type: Boolean,
        required: true,
        default: false
    }
});

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
        required: [true, 'Duration is required']
    },
    minPrice: {
        type: Number,
        required: [true, 'Min price is required'],
        default: 0.0
    },
    maxPrice: {
        type: Number,
        required: [true, 'Max price is required'],
        default: 0.0
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
        requestSchema
    ]
});

module.exports = mongoose.model('Job', jobSchema);