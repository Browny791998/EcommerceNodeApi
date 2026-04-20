const express = require('express');
const { createCategory, updateCategory, deleteCategory, getCategory, getallCategory } = require('../contollers/prodcategoryCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getallCategory)
router.post('/', authMiddleware, isAdmin, createCategory)
router.get('/:id', getCategory)
router.put('/:id', authMiddleware, isAdmin, updateCategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)
module.exports = router;