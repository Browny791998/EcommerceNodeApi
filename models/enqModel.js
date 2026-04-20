const mongoose = require('mongoose');

var enqSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    mobile: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Submitted',
        enum: ['Submitted', 'Contacted', 'In Progress', 'Resolved'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Enquiry', enqSchema);
