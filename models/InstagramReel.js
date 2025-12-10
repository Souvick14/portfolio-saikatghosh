// ============================================
// Instagram Reel Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const instagramReelSchema = new mongoose.Schema({
    reelUrl: {
        type: String,
        required: [true, 'Instagram reel URL is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/.test(v);
            },
            message: 'Please provide a valid Instagram reel URL'
        }
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
        default: [],
        trim: true
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
