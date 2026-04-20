const mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        trim: true,
    },
    comment: {
        type: String,
        required: true,
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: 'approved',
        enum: ['pending', 'approved', 'rejected'],
    },
}, {
    timestamps: true,
});

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
