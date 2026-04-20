const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
    fullName:   { type: String, required: true },
    phone:      { type: String, required: true },
    street:     { type: String, required: true },
    city:       { type: String, required: true },
    state:      { type: String, required: true },
    postalCode: { type: String, required: true },
    country:    { type: String, required: true },
}, { _id: false });

const paymentIntentSchema = new mongoose.Schema({
    id:       { type: String, required: true },
    method:   { type: String, required: true, enum: ['COD', 'Stripe', 'PayPal', 'Bank Transfer'] },
    amount:   { type: Number, required: true, min: 0 },
    status:   { type: String, required: true },
    currency: { type: String, required: true, default: 'usd' },
    created:  { type: Date, default: Date.now },
}, { _id: false });

var orderSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            count:   { type: Number, required: true, min: 1 },
            color:   String,
            price:   { type: Number, required: true, min: 0 },
        }
    ],
    paymentIntent:   { type: paymentIntentSchema, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    orderStatus: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Cash on Delivery', 'Processing', 'Dispatched', 'Cancelled', 'Delivered'],
    },
    trackingNumber: {
        type: String,
        default: null,
    },
    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
