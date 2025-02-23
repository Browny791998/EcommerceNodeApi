const express = require('express');
const { createBrand, updateBrand, deleteBrand, getBrand, getallBrand } = require('../contollers/brandCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/',authMiddleware, isAdmin, getallBrand)
router.post('/',authMiddleware, isAdmin, createBrand)
router.get('/:id',authMiddleware, isAdmin, getBrand)
router.put('/:id',authMiddleware, isAdmin, updateBrand)
router.delete('/:id',authMiddleware, isAdmin, deleteBrand)
module.exports = router;