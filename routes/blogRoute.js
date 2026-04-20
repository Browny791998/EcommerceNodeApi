const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages } = require('../contollers/blogCtrl');
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadImages');
const router = express.Router();

// Static paths before /:id
router.get('/', getAllBlogs);                                          // public — readers can browse blogs
router.post('/', authMiddleware, isAdmin, createBlog);
router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, dislikeBlog);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 2), blogImgResize, uploadImages);

// /:id routes last
router.get('/:id', getBlog);                                          // public — readers can read a blog
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);

module.exports = router;
