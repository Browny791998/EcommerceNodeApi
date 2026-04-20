const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const createBrand = asyncHandler(async (req, res) => {
    const newBrand = await Brand.create(req.body);
    res.json(newBrand);
});

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const updated = await Brand.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) throw new Error('Brand not found');
    res.json(updated);
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) throw new Error('Brand not found');
    res.json(deleted);
});

const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const brand = await Brand.findById(id);
    if (!brand) throw new Error('Brand not found');
    res.json(brand);
});

const getallBrand = asyncHandler(async (req, res) => {
    const brands = await Brand.find().sort('title');
    res.json(brands);
});

module.exports = { createBrand, updateBrand, deleteBrand, getBrand, getallBrand };
