const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const User = require('../models/userModel');
const validateMongoDbId = require('../utils/validateMongodbId');
const {cloudinaryUploadImg,cloudinaryDeleteImg} = require('../utils/cloudinary');
const fs = require('fs');
const createProduct = asyncHandler(async (req, res) => {
   try {
      if (req.body.title) {
         req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body)
      res.json(
         newProduct
      )
   }
   catch (err) {
      throw new Error(err)
   }
})

const updateProduct = asyncHandler(async (req, res) => {
   const id = req.params.id;
   try {
      if (req.body.title) {
         req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true });
      res.json(updateProduct);
   }
   catch (error) {
      throw new Error(error);
   }
})

const deleteProduct = asyncHandler(async (req, res) => {
   const { id } = req.params;
   try {
      const deleteProduct = await Product.findOneAndDelete(id);
      res.json(deleteProduct);
   }
   catch (error) {
      throw new Error(error);
   }
})

const getaProduct = asyncHandler(async (req, res) => {
   const { id } = req.params;
   try {
      const findProduct = await Product.findById(id);
      res.json(
         findProduct
      )
   }
   catch (err) {
      throw new Error(err)
   }
})

const getAllProduct = asyncHandler(async (req, res) => {
   const { id } = req.params;
   try {
      //Filtering
      const queryObj = { ...req.query };
      const excludeFields = ["page", "sort", "limit", "fields"]
      excludeFields.forEach((el) => {
         delete queryObj[el]
      });
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|lte|lt)\b/g, (match) => `$${match}`);
      let query = Product.find(JSON.parse(queryStr));

      //Sorting
      if (req.query.sort) {
         const sortBy = req.query.sort.split(',').join(" ");
         query = query.sort(sortBy);
      } else {
         query = query.sort("-createdAt")
      }

      //limiting the fields
      if (req.query.fields) {
         const fields = req.query.fields;
         query = query.select(fields);
      } else {
         query = query.select('__v')
      }

      //pagination
      const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      query = query.skip(skip);
      if (req.query.page) {
         const productCount = await Product.countDocuments();
         if (skip >= productCount) throw new Error("This Page does not exist")
      }
      const product = await query;
      const getallProducts = await Product.find();
      res.json(
         getallProducts
      )
   }
   catch (err) {
      throw new Error(err)
   }
})


const addToWishlist = asyncHandler(async (req, res) => {
   const { _id } = req.user;
   const { productId } = req.body;
   try {
      const user = await User.findById(_id);
      const alreadyadded = await user.wishlist.find((id) => id.toString() === productId);
      if (alreadyadded) {
         let user = await User.findByIdAndUpdate(
            _id,
            {
               $pull: { wishlist: productId }
            },
            {
               new: true,
            }
         );
         res.json(user);
      } else {
         let user = await User.findByIdAndUpdate(
            _id,
            {
               $push: { wishlist: productId }
            },
            {
               new: true,
            }
         );
         res.json(user);
      }

   } catch (error) {
      throw new Error(error);
   }
})

const rating = asyncHandler(async (req, res) => {
   try {
      const { _id } = req.user;
      const { star, productId, comment } = req.body;
      const product = await Product.findById(productId);
      let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());
      if(alreadyRated) {
          const updateRating = await Product.updateOne( {
            ratings: { $elemMatch: alreadyRated},
          },
          {
            $set: {"ratings.$.star": star,"ratings.$.comment": comment},
          },{
            new:true
          }
          );
      } else {
         const rateProduct = await Product.findByIdAndUpdate(
            productId,
            {
               $push: {
                  ratings: {
                     star: star,
                     comment: comment,
                     postedby: _id
                  }
               }
            }, {
               new: true,
            }
         );
      }
      const getallratings = await Product.findById(productId);
      let totalRating = getallratings.ratings.length;
      let ratingsum = getallratings.ratings
      .map((item)=> item.star)
      .reduce( (prev,curr) => prev + curr, 0);
      let actualRating = Math.round(ratingsum / totalRating);
     let finalproduct =  await Product.findByIdAndUpdate( productId, {
         totalrating: actualRating,
      }, {new: true});
      res.json(finalproduct);
   } catch (error) {
      throw new Error(error);
   }

})

const uploadImages = asyncHandler(async (req,res) => {
//  const {id} = req.params;
//  validateMongoDbId(id);
 try {
      const uploader = (path) => cloudinaryUploadImg(path,"images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
         const {path} = file;
         const newpath = await uploader(path);
         urls.push(newpath);
         // fs.unlinkSync(path);
      }
      const images = urls.map((file) => {
         return file;
      })
      res.json(images);
      // const findProduct = await Product.findByIdAndUpdate(id, {
      //    images: urls.map((file) => {
      //       return file;
      //    })
      // }, {new: true});
      // res.json(findProduct);
 }
 catch (error) {
   throw new Error(error);
 }

});

 const deleteImages = asyncHandler(async (req,res) => {
   const {id} = req.params;
   //  const {id} = req.params;
   //  validateMongoDbId(id);
    try {
         const deleted = cloudinaryDeleteImg(id,"images");
         res.json({message: "Deleted"});
    }
 catch (error) {
   throw new Error(error);
 }
})

module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages, deleteImages };