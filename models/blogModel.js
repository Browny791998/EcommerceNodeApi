const mongoose = require('mongoose');

var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BCategory',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    numViews: {
        type: Number,
        default: 0,
        min: 0,
    },
    likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    images: [
        {
            public_id: { type: String, required: true },
            url:       { type: String, required: true },
        }
    ],
}, {
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
    timestamps: true,
});

blogSchema.virtual('likesCount').get(function () {
    return this.likes.length;
});

blogSchema.virtual('dislikesCount').get(function () {
    return this.dislikes.length;
});

module.exports = mongoose.model('Blog', blogSchema);
