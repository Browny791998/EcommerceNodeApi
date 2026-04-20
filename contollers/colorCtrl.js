const Color = require('../models/colorModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const createColor = asyncHandler(async (req, res) => {
    const newColor = await Color.create(req.body);
    res.json(newColor);
});

const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const updated = await Color.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) throw new Error('Color not found');
    res.json(updated);
});

const deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Color.findByIdAndDelete(id);
    if (!deleted) throw new Error('Color not found');
    res.json(deleted);
});

const getColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const color = await Color.findById(id);
    if (!color) throw new Error('Color not found');
    res.json(color);
});

const getallColor = asyncHandler(async (req, res) => {
    const colors = await Color.find().sort('title');
    res.json(colors);
});

module.exports = { createColor, updateColor, deleteColor, getColor, getallColor };
