const Category = require('../models/blogCatModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const createCategory = asyncHandler(async (req, res) => {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) throw new Error('Category not found');
    res.json(updated);
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) throw new Error('Category not found');
    res.json(deleted);
});

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await Category.findById(id);
    if (!category) throw new Error('Category not found');
    res.json(category);
});

const getallCategory = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort('title');
    res.json(categories);
});

module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getallCategory };
