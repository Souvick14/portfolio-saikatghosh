const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    excerpt: {
        type: String,
        trim: true,
        default: function() {
            // Auto-generate excerpt from content (first 150 characters)
            return this.content ? this.content.substring(0, 150) + '...' : '';
        }
    },
    coverImage: {
        type: String,
        trim: true,
        default: 'https://via.placeholder.com/800x400/764ba2/ffffff?text=Blog+Post'
    },
    category: {
        type: String,
        enum: ['tutorial', 'tips', 'showcase', 'news', 'other'],
        default: 'other'
    },
    tags: {
        type: [String],
        default: []
    },
    author: {
        type: String,
        default: 'Admin'
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    order: {
        type: Number,
        default: 0
    },
    published: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
blogSchema.index({ publishDate: -1, order: 1 });

module.exports = mongoose.model('Blog', blogSchema);
