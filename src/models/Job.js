const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

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
    name: {
        type: String,
        require: [true, 'Name is required']
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
                'Cancelled',
                'Expired'
            ]
        }
    },
    requests: [
        requestSchema
    ],
    assignment: {
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        files: {
            type: String
        },
        deadline: {
            type: Date
        }
    }
});

jobSchema.plugin(toJSON);
jobSchema.plugin(paginate);

/**
 * @typedef Job
 */
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;