const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const createCoupon = asyncHandler(async (req, res) => {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
});

const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json(coupons);
});

const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new Error('Coupon not found');
    res.json(coupon);
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const updated = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) throw new Error('Coupon not found');
    res.json(updated);
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) throw new Error('Coupon not found');
    res.json(deleted);
});

module.exports = { createCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon };
