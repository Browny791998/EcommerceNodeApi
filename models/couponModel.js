const mongoose = require('mongoose');

var couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'flat'],
        default: 'percentage',
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
    },
    maxDiscount: {
        type: Number,
        default: null,
        min: 0,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    expiry: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: null,
        min: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    perUserLimit: {
        type: Number,
        default: 1,
        min: 1,
    },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
