const express = require('express');
const { createBrand, updateBrand, deleteBrand, getBrand, getallBrand } = require('../contollers/brandCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getallBrand)
router.post('/', authMiddleware, isAdmin, createBrand)
router.get('/:id', getBrand)
router.put('/:id', authMiddleware, isAdmin, updateBrand)
router.delete('/:id', authMiddleware, isAdmin, deleteBrand)
module.exports = router;