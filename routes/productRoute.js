const express = require('express');
const {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
    deleteImages,
} = require('../contollers/productCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

const router = express.Router();

// Static paths must come before /:id to avoid route conflicts
router.get('/', getAllProduct);
router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);

// Upload images to a specific product — :id is the product id
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages);

// Delete an image by public_id (passed in body) and remove from product
router.delete('/delete-img', authMiddleware, isAdmin, deleteImages);

// Dynamic /:id routes last
router.get('/:id', getaProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
