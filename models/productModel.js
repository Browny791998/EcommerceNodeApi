const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discountPrice: {
        type: Number,
        min: 0,
        default: null,
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PCategory',
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    sold: {
        type: Number,
        default: 0,
        min: 0,
    },
    images: [
        {
            public_id: { type: String, required: true },
            url:       { type: String, required: true },
        }
    ],
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }],
    tags: [String],
    ratings: [
        {
            star:     { type: Number, required: true, min: 1, max: 5 },
            comment:  String,
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        }
    ],
    totalrating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
