const mongoose = require('mongoose');

var paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    method: {
        type: String,
        required: true,
        enum: ['COD', 'Stripe', 'PayPal', 'Bank Transfer'],
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        default: 'usd',
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'completed', 'failed', 'refunded'],
    },
    transactionId: {
        type: String,
        default: null,
    },
    refundedAt: {
        type: Date,
        default: null,
    },
    refundReason: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
