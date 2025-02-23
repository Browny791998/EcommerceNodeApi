const express = require('express');
const { createUser, loginUserCtrl, getallUser, getaUser, deleteUser, updateaUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdminCtrl, getWishList, saveAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus } = require('../contollers/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken)
router.put('/reset-password/:token', resetPassword)
router.put('/password', authMiddleware, updatePassword);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdminCtrl);
router.post('/cart',authMiddleware, userCart);
router.post('/cart/applycoupon',authMiddleware, applyCoupon);
router.post('/cart/cash-order',authMiddleware, createOrder);
router.get('/cart',authMiddleware, getUserCart);

router.get('/all-users', getallUser);
router.get('/get-orders',authMiddleware, getOrders);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/wishlist', authMiddleware, getWishList);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete('/empty-cart',authMiddleware, emptyCart);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);

router.put('/edit-user', authMiddleware, updateaUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);

module.exports = router;