const express = require('express');
const { createEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, getallEnquiry } = require('../contollers/enqCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public — any visitor can submit an enquiry
router.post('/', createEnquiry);

// Admin only
router.get('/', authMiddleware, isAdmin, getallEnquiry);
router.get('/:id', authMiddleware, isAdmin, getEnquiry);
router.put('/:id', authMiddleware, isAdmin, updateEnquiry);
router.delete('/:id', authMiddleware, isAdmin, deleteEnquiry);

module.exports = router;
