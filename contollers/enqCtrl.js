const Enquiry = require('../models/enqModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

// Public — any visitor can submit an enquiry
const createEnquiry = asyncHandler(async (req, res) => {
    const newEnquiry = await Enquiry.create(req.body);
    res.json(newEnquiry);
});

const updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const updated = await Enquiry.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) throw new Error('Enquiry not found');
    res.json(updated);
});

const deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Enquiry.findByIdAndDelete(id);
    if (!deleted) throw new Error('Enquiry not found');
    res.json(deleted);
});

const getEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) throw new Error('Enquiry not found');
    res.json(enquiry);
});

const getallEnquiry = asyncHandler(async (req, res) => {
    const enquiries = await Enquiry.find().sort('-createdAt');
    res.json(enquiries);
});

module.exports = { createEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, getallEnquiry };
