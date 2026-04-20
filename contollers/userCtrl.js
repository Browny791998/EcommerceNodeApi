const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const uniqid = require('uniqid');

const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser) throw new Error('User already exists');
    const newUser = await User.create(req.body);
    res.json(newUser);
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser || !(await findUser.isPasswordMatched(password))) {
        throw new Error('Invalid Credentials');
    }
    const refreshToken = generateRefreshToken(findUser._id);
    await User.findByIdAndUpdate(findUser._id, { refreshToken }, { new: true });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
        _id:       findUser._id,
        firstname: findUser.firstname,
        lastname:  findUser.lastname,
        email:     findUser.email,
        mobile:    findUser.mobile,
        token:     generateToken(findUser._id),
    });
});

const loginAdminCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email });
    if (!findAdmin) throw new Error('Invalid Credentials');
    if (findAdmin.role !== 'admin') throw new Error('Not Authorised');
    if (!(await findAdmin.isPasswordMatched(password))) throw new Error('Invalid Credentials');
    const refreshToken = generateRefreshToken(findAdmin._id);
    await User.findByIdAndUpdate(findAdmin._id, { refreshToken }, { new: true });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
        _id:       findAdmin._id,
        firstname: findAdmin.firstname,
        lastname:  findAdmin.lastname,
        email:     findAdmin.email,
        mobile:    findAdmin.mobile,
        role:      findAdmin.role,
        token:     generateToken(findAdmin._id),
    });
});

const getallUser = asyncHandler(async (req, res) => {
    const getUsers = await User.find();
    res.json(getUsers);
});

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw new Error('User not found');
    res.json(deleted);
});

const updateaUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const updateUser = await User.findByIdAndUpdate(
        _id,
        {
            firstname: req.body.firstname,
            lastname:  req.body.lastname,
            email:     req.body.email,
            mobile:    req.body.mobile,
        },
        { new: true, runValidators: true }
    );
    res.json(updateUser);
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    res.json({ message: 'User Blocked' });
});

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    res.json({ message: 'User Unblocked' });
});

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refresh token in cookie');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error('No refresh token in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error('There is something wrong with the refresh token');
        }
        const accessToken = generateToken(user._id);
        res.json({ accessToken });
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refresh token in cookie');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    if (!user) return res.sendStatus(204);
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: '' });
    res.sendStatus(204);
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found with that email');
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, please follow this link to reset your password. This link is valid for 10 minutes. <a href='${process.env.CLIENT_URL}/reset-password/${token}'>Click here</a>`;
    await sendEmail({
        to:      email,
        text:    'Reset your password',
        subject: 'Forgot Password Link',
        html:    resetURL,
    });
    res.json({ message: 'Reset password email sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken:   hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error('Token expired, please try again later.');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
});

// Manage user addresses (add / set default)
const addAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const { setDefault, ...addressData } = req.body;
    const user = await User.findById(_id);
    if (!user) throw new Error('User not found');
    if (setDefault) {
        user.addresses.forEach((a) => { a.isDefault = false; });
    }
    if (user.addresses.length === 0) addressData.isDefault = true;
    user.addresses.push(addressData);
    await user.save();
    res.json(user.addresses);
});

const updateAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { addressId } = req.params;
    validateMongoDbId(_id);
    const { setDefault, ...addressData } = req.body;
    const user = await User.findById(_id);
    if (!user) throw new Error('User not found');
    const address = user.addresses.id(addressId);
    if (!address) throw new Error('Address not found');
    if (setDefault) {
        user.addresses.forEach((a) => { a.isDefault = false; });
        addressData.isDefault = true;
    }
    Object.assign(address, addressData);
    await user.save();
    res.json(user.addresses);
});

const deleteAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { addressId } = req.params;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (!user) throw new Error('User not found');
    user.addresses.pull({ _id: addressId });
    await user.save();
    res.json(user.addresses);
});

const getWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const findUser = await User.findById(_id).populate('wishlist');
    res.json(findUser);
});

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
        await alreadyExistCart.deleteOne();
    }
    let products = [];
    for (const item of cart) {
        const product = await Product.findById(item._id).select('price').exec();
        if (!product) throw new Error(`Product ${item._id} not found`);
        products.push({
            product: item._id,
            count:   item.count,
            color:   item.color,
            price:   product.price,
        });
    }
    const cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0);
    const newCart = await Cart.create({ products, cartTotal, orderby: user._id });
    const populated = await newCart.populate('products.product');
    res.json(populated);
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const cart = await Cart.findOne({ orderby: _id }).populate('products.product');
    if (!cart) return res.json({ products: [], cartTotal: 0, totalAfterDiscount: null });
    res.json(cart);
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    const cart = await Cart.findOneAndDelete({ orderby: user._id });
    res.json(cart);
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    const validCoupon = await Coupon.findOne({ name: coupon.toUpperCase(), isActive: true });
    if (!validCoupon) throw new Error('Invalid or inactive coupon');
    if (validCoupon.expiry < Date.now()) throw new Error('Coupon has expired');
    if (validCoupon.usageLimit !== null && validCoupon.usedCount >= validCoupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
    }
    const alreadyUsed = validCoupon.usedBy.filter(
        (uid) => uid.toString() === _id.toString()
    ).length;
    if (alreadyUsed >= validCoupon.perUserLimit) {
        throw new Error('You have already used this coupon');
    }

    const cartDoc = await Cart.findOne({ orderby: _id });
    if (!cartDoc) throw new Error('Cart not found');
    if (validCoupon.minOrderAmount && cartDoc.cartTotal < validCoupon.minOrderAmount) {
        throw new Error(`Minimum order amount is ${validCoupon.minOrderAmount}`);
    }

    let discount;
    if (validCoupon.discountType === 'flat') {
        discount = validCoupon.discount;
    } else {
        discount = (cartDoc.cartTotal * validCoupon.discount) / 100;
        if (validCoupon.maxDiscount) {
            discount = Math.min(discount, validCoupon.maxDiscount);
        }
    }
    const totalAfterDiscount = parseFloat((cartDoc.cartTotal - discount).toFixed(2));

    await Cart.findOneAndUpdate({ orderby: _id }, { totalAfterDiscount }, { new: true });

    // Mark coupon as used
    await Coupon.findByIdAndUpdate(validCoupon._id, {
        $inc:  { usedCount: 1 },
        $push: { usedBy: _id },
    });

    res.json({ totalAfterDiscount });
});

const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied, shippingAddress } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    if (!COD) throw new Error('Create cash order failed');
    if (!shippingAddress) throw new Error('Shipping address is required');

    const user = await User.findById(_id);
    const userCart = await Cart.findOne({ orderby: user._id });
    if (!userCart) throw new Error('Cart is empty');

    const finalAmount = couponApplied && userCart.totalAfterDiscount
        ? userCart.totalAfterDiscount
        : userCart.cartTotal;

    // Snapshot price from cart into order products
    const orderedProducts = userCart.products.map((item) => ({
        product: item.product,
        count:   item.count,
        color:   item.color,
        price:   item.price,
    }));

    await Order.create({
        products: orderedProducts,
        paymentIntent: {
            id:       uniqid(),
            method:   'COD',
            amount:   finalAmount,
            status:   'Cash on Delivery',
            created:  Date.now(),
            currency: 'usd',
        },
        shippingAddress,
        orderby:     user._id,
        orderStatus: 'Cash on Delivery',
    });

    // Decrement stock
    const bulkUpdate = userCart.products.map((item) => ({
        updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: -item.count, sold: item.count } },
        },
    }));
    await Product.bulkWrite(bulkUpdate);

    // Clear the cart after successful order
    await Cart.findOneAndDelete({ orderby: user._id });

    res.json({ message: 'Order placed successfully' });
});

const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const userOrders = await Order.find({ orderby: _id })
        .populate('products.product')
        .sort('-createdAt');
    res.json(userOrders);
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('products.product')
        .populate('orderby', 'firstname lastname email')
        .sort('-createdAt');
    res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, trackingNumber } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    const update = { orderStatus: status, 'paymentIntent.status': status };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    const updated = await Order.findByIdAndUpdate(id, update, { new: true });
    if (!updated) throw new Error('Order not found');
    res.json(updated);
});

module.exports = {
    createUser,
    loginUserCtrl,
    loginAdminCtrl,
    getallUser,
    getaUser,
    deleteUser,
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    addAddress,
    updateAddress,
    deleteAddress,
    getWishList,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    getAllOrders,
    updateOrderStatus,
};
