const express = require('express');
const {
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
} = require('../contollers/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Auth
router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdminCtrl);
router.get('/refresh', handleRefreshToken);
router.post('/logout', logout);                         // POST — modifies server state

// Password
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);

// Profile (static paths before /:id)
router.put('/edit-user', authMiddleware, updateaUser);
router.get('/wishlist', authMiddleware, getWishList);

// Addresses
router.post('/address', authMiddleware, addAddress);
router.put('/address/:addressId', authMiddleware, updateAddress);
router.delete('/address/:addressId', authMiddleware, deleteAddress);

// Cart (static paths before /:id)
router.post('/cart', authMiddleware, userCart);
router.get('/cart', authMiddleware, getUserCart);
router.delete('/empty-cart', authMiddleware, emptyCart);
router.post('/cart/applycoupon', authMiddleware, applyCoupon);

// Orders (static paths before /:id)
router.post('/cart/cash-order', authMiddleware, createOrder);
router.get('/get-orders', authMiddleware, getOrders);
router.get('/all-orders', authMiddleware, isAdmin, getAllOrders);
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);

// Admin user management (static paths before /:id)
router.get('/all-users', authMiddleware, isAdmin, getallUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
router.delete('/:id', authMiddleware, isAdmin, deleteUser);

// /:id LAST — must come after all static routes
router.get('/:id', authMiddleware, isAdmin, getaUser);

module.exports = router;
