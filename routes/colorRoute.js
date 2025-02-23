const express = require('express');
const { createColor, updateColor, deleteColor, getColor, getallColor } = require('../contollers/ColorCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/',authMiddleware, isAdmin, getallColor)
router.post('/',authMiddleware, isAdmin, createColor)
router.get('/:id',authMiddleware, isAdmin, getColor)
router.put('/:id',authMiddleware, isAdmin, updateColor)
router.delete('/:id',authMiddleware, isAdmin, deleteColor)
module.exports = router;