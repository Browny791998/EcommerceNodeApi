const express = require('express');
const { createEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, getallEnquiry } = require('../contollers/enqCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/',authMiddleware, isAdmin, getallEnquiry)
router.post('/',authMiddleware, isAdmin, createEnquiry)
router.get('/:id',authMiddleware, isAdmin, getEnquiry)
router.put('/:id',authMiddleware, isAdmin, updateEnquiry)
router.delete('/:id',authMiddleware, isAdmin, deleteEnquiry)
module.exports = router;