// ============================================
// YouTube Video Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const youtubeVideoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: [true, 'YouTube video ID is required'],
        trim: true,
        validate: {
            validator: function(v) {
                // YouTube video IDs are typically 11 characters
                return /^[A-Za-z0-9_-]{11}$/.test(v);
            },
            message: 'Please provide a valid YouTube video ID (11 characters)'
        }
    },
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    thumbnailUrl: {
        type: String,
        trim: true,
        default: function() {
            // Auto-generate thumbnail URL from video ID
            return `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`;
        }
    },
    category: {
        type: String,
        enum: ['shorts', 'long-form', 'tutorial', 'vlog', 'other'],
        default: 'other'
    },
    order: {
        type: Number,
        default: 0
    },
    genre: {
        type: String,
        default: 'Others',
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient sorting
youtubeVideoSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('YouTubeVideo', youtubeVideoSchema);
