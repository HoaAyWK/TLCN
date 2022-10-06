const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        minLength: [2, 'Name must be between 2 to 50 characters'],
        maxLength: [50, 'Name must be between 2 to 50 characters'],
        unique: true
    },
    description: String,
    image: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        }
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }
    ],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    }
}, { timestamps: true });

categorySchema.plugin(toJSON);

/**
 * @typedef Category
 */
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;