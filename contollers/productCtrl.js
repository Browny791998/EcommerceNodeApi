const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const User = require('../models/userModel');
const validateMongoDbId = require('../utils/validateMongodbId');
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../utils/cloudinary');
const fs = require('fs');

const createProduct = asyncHandler(async (req, res) => {
    if (req.body.title) {
        req.body.slug = slugify(req.body.title, { lower: true });
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    if (req.body.title) {
        req.body.slug = slugify(req.body.title, { lower: true });
    }
    const updated = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updated) throw new Error('Product not found');
    res.json(updated);
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) throw new Error('Product not found');
    res.json(deleted);
});

const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    const product = await Product.findById(id)
        .populate('category', 'title')
        .populate('brand', 'title')
        .populate('color', 'title');
    if (!product) throw new Error('Product not found');
    res.json(product);
});

const getAllProduct = asyncHandler(async (req, res) => {
    const { page, sort, limit: limitQ, fields, ...rawFilters } = req.query;

    // Build the filter object
    const filter = {};

    // Price range: price[gte] / price[lte] come in as rawFilters['price[gte]'] etc.
    // Express also parses bracket notation into nested objects: rawFilters.price = { gte: '...' }
    if (rawFilters.price) {
        filter.price = {};
        if (rawFilters.price.gte !== undefined) filter.price.$gte = Number(rawFilters.price.gte);
        if (rawFilters.price.lte !== undefined) filter.price.$lte = Number(rawFilters.price.lte);
        if (rawFilters.price.gt  !== undefined) filter.price.$gt  = Number(rawFilters.price.gt);
        if (rawFilters.price.lt  !== undefined) filter.price.$lt  = Number(rawFilters.price.lt);
        delete rawFilters.price;
    }

    // category, brand, color — may be a single id string or comma-separated ids
    for (const field of ['category', 'brand', 'color']) {
        if (rawFilters[field]) {
            const ids = String(rawFilters[field]).split(',').filter(Boolean);
            filter[field] = ids.length === 1 ? ids[0] : { $in: ids };
            delete rawFilters[field];
        }
    }

    // Title keyword search — case-insensitive regex
    if (rawFilters.search) {
        filter.title = { $regex: rawFilters.search, $options: 'i' };
        delete rawFilters.search;
    }

    // Any remaining simple filters (e.g. tags)
    Object.assign(filter, rawFilters);

    // Sorting
    const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

    // Pagination
    const pageNum = parseInt(page, 10)   || 1;
    const limitNum = parseInt(limitQ, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Count + fetch in parallel
    const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter)
            .populate('category', 'title')
            .populate('brand', 'title')
            .populate('color', 'title')
            .sort(sortBy)
            .select(fields ? fields.split(',').join(' ') : '')
            .skip(skip)
            .limit(limitNum),
    ]);

    res.json({ total, products });
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId } = req.body;
    validateMongoDbId(productId);
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.some((id) => id.toString() === productId);
    const update = alreadyAdded
        ? { $pull: { wishlist: productId } }
        : { $push: { wishlist: productId } };
    const updated = await User.findByIdAndUpdate(_id, update, { new: true });
    res.json(updated);
});

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, productId, comment } = req.body;
    validateMongoDbId(productId);

    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const alreadyRated = product.ratings.find(
        (r) => r.postedby.toString() === _id.toString()
    );

    if (alreadyRated) {
        await Product.updateOne(
            { 'ratings._id': alreadyRated._id },
            { $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } }
        );
    } else {
        await Product.findByIdAndUpdate(productId, {
            $push: { ratings: { star, comment, postedby: _id } },
        });
    }

    const updated = await Product.findById(productId);
    const avgRating = Math.round(
        updated.ratings.reduce((sum, r) => sum + r.star, 0) / updated.ratings.length
    );
    const final = await Product.findByIdAndUpdate(
        productId,
        { totalrating: avgRating },
        { new: true }
    );
    res.json(final);
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
    const product = await Product.findByIdAndUpdate(
        id,
        { $push: { images: { $each: urls } } },
        { new: true }
    );
    if (!product) throw new Error('Product not found');
    res.json(product);
});

const deleteImages = asyncHandler(async (req, res) => {
    const { productId, public_id } = req.body;
    if (!public_id) throw new Error('public_id is required');

    // Only call Cloudinary if it looks like a real public_id (not a plain URL)
    const isUrl = public_id.startsWith('http://') || public_id.startsWith('https://');
    if (!isUrl) {
        await cloudinaryDeleteImg(public_id);
    }

    // Remove the image entry from the product's images array
    if (productId) {
        validateMongoDbId(productId);
        await Product.findByIdAndUpdate(productId, {
            $pull: { images: { public_id } },
        });
    }

    res.json({ message: 'Image deleted' });
});

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
    deleteImages,
};
