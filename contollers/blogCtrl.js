const Blog = require('../models/blogModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const { cloudinaryUploadImg } = require('../utils/cloudinary');
const fs = require('fs');


const createBlog = asyncHandler(async (req, res) => {
    // author comes from the logged-in user
    req.body.author = req.user._id;
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const updated = await Blog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) throw new Error('Blog not found');
    res.json(updated);
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) throw new Error('Blog not found');
    res.json(deleted);
});

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const blog = await Blog.findByIdAndUpdate(
        id,
        { $inc: { numViews: 1 } },
        { new: true }
    )
        .populate('likes', 'firstname lastname')
        .populate('dislikes', 'firstname lastname')
        .populate('author', 'firstname lastname');
    if (!blog) throw new Error('Blog not found');
    res.json(blog);
});

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find()
        .populate('author', 'firstname lastname')
        .populate('category', 'title')
        .sort('-createdAt');
    res.json(blogs);
});

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    const loginUserId = req.user._id;
    const blog = await Blog.findById(blogId);
    if (!blog) throw new Error('Blog not found');

    const alreadyLiked    = blog.likes.some((id) => id.toString() === loginUserId.toString());
    const alreadyDisliked = blog.dislikes.some((id) => id.toString() === loginUserId.toString());

    let update;
    if (alreadyDisliked) {
        // remove from dislikes, add to likes
        update = { $pull: { dislikes: loginUserId }, $push: { likes: loginUserId } };
    } else if (alreadyLiked) {
        // toggle off
        update = { $pull: { likes: loginUserId } };
    } else {
        update = { $push: { likes: loginUserId } };
    }

    const updated = await Blog.findByIdAndUpdate(blogId, update, { new: true });
    res.json(updated);
});

const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    const loginUserId = req.user._id;
    const blog = await Blog.findById(blogId);
    if (!blog) throw new Error('Blog not found');

    const alreadyLiked    = blog.likes.some((id) => id.toString() === loginUserId.toString());
    const alreadyDisliked = blog.dislikes.some((id) => id.toString() === loginUserId.toString());

    let update;
    if (alreadyLiked) {
        // remove from likes, add to dislikes
        update = { $pull: { likes: loginUserId }, $push: { dislikes: loginUserId } };
    } else if (alreadyDisliked) {
        // toggle off
        update = { $pull: { dislikes: loginUserId } };
    } else {
        update = { $push: { dislikes: loginUserId } };
    }

    const updated = await Blog.findByIdAndUpdate(blogId, update, { new: true });
    res.json(updated);
});

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const urls = [];
    for (const file of req.files) {
        const result = await cloudinaryUploadImg(file.path);
        urls.push({ public_id: result.public_id, url: result.url });
        fs.unlinkSync(file.path);
    }
    const blog = await Blog.findByIdAndUpdate(
        id,
        { images: urls },
        { new: true }
    );
    if (!blog) throw new Error('Blog not found');
    res.json(blog);
});

module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages };
