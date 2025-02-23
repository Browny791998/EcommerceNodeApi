const Enquiry = require('../models/enqModel')
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId")

const createEnquiry = asyncHandler(async(req,res) => {
    try {
      const newEnquiry = await Enquiry.create(req.body);
      res.json(newEnquiry);  
    } catch (error) {
        throw new Error(error);
    }
})

const updateEnquiry = asyncHandler(async(req,res) => {
  const id = req.params.id;
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.json(updatedEnquiry);  
  } catch (error) {
      throw new Error(error);
  }
})

const deleteEnquiry = asyncHandler(async(req,res) => {
  const {id} = req.params;
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
    res.json(deletedEnquiry);  
  } catch (error) {
      throw new Error(error);
  }
})

const getEnquiry = asyncHandler(async(req,res) => {
  const {id} = req.params;
  try {
    const getEnquiry = await Enquiry.findById(id);
    res.json(getEnquiry);  
  } catch (error) {
      throw new Error(error);
  }
})

const getallEnquiry = asyncHandler(async(req,res) => {
  const {id} = req.params;
  try {
    const getallEnquiry = await Enquiry.find();
    res.json(getallEnquiry);  
  } catch (error) {
      throw new Error(error);
  }
})
module.exports = {createEnquiry,updateEnquiry,deleteEnquiry,getEnquiry,getallEnquiry};