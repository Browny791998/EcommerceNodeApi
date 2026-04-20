const express = require('express');
const { createColor, updateColor, deleteColor, getColor, getallColor } = require('../contollers/colorCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getallColor)
router.post('/', authMiddleware, isAdmin, createColor)
router.get('/:id', getColor)
router.put('/:id', authMiddleware, isAdmin, updateColor)
router.delete('/:id', authMiddleware, isAdmin, deleteColor)
module.exports = router;