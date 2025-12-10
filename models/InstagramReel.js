// ============================================
// Instagram Reel Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const instagramReelSchema = new mongoose.Schema({
    reelUrl: {
        type: String,
        required: [true, 'Video URL is required'],
        trim: true
        // Removed Instagram-only validation to support Google Drive, direct videos, etc.
    },
    videoUrl: {
        type: String,
        trim: true,
        default: ''
        // Cloudinary video URL for uploaded preview videos
    },
    reelId: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    technologies: {
        type: [String],
        default: []
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Extract reel ID before saving
instagramReelSchema.pre('save', function(next) {
    if (this.reelUrl && !this.reelId) {
        const match = this.reelUrl.match(/reel\/([A-Za-z0-9_-]+)/);
        if (match) {
            this.reelId = match[1];
        }
    }
    next();
});

module.exports = mongoose.model('InstagramReel', instagramReelSchema);
