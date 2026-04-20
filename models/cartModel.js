const mongoose = require('mongoose');

var cartSchema = new mongoose.Schema({
    products: [
        {
            product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            count:    { type: Number, required: true, min: 1 },
            color:    String,
            price:    { type: Number, required: true, min: 0 },
        }
    ],
    cartTotal:          { type: Number, default: 0, min: 0 },
    totalAfterDiscount: { type: Number, min: 0 },
    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        index: { expires: 0 },
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);
