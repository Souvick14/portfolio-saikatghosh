// ============================================
// Commercial Work Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const commercialWorkSchema = new mongoose.Schema({
    youtubeUrl: {
        type: String,
        required: [true, 'YouTube URL is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(v);
            },
            message: 'Please provide a valid YouTube URL'
        }
    },
    videoId: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Brand/Client name is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    engagement: {
        type: String,
        default: '',
        trim: true
    },
    revenue: {
        type: String,
        default: '',
        trim: true
    },
    views: {
        type: String,
        default: '0'
    },
    metadata: {
        thumbnail: String,
        duration: String,
        publishedAt: Date
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Extract video ID before saving
commercialWorkSchema.pre('save', function(next) {
    if (this.youtubeUrl && !this.videoId) {
        // Extract video ID from various YouTube URL formats
        let videoId = null;
        
        // youtu.be/VIDEO_ID
        let match = this.youtubeUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
        if (match) {
            videoId = match[1];
        } else {
            // youtube.com/watch?v=VIDEO_ID
            match = this.youtubeUrl.match(/[?&]v=([A-Za-z0-9_-]+)/);
            if (match) {
                videoId = match[1];
            }
        }
        
        if (videoId) {
            this.videoId = videoId;
        }
    }
    next();
});

module.exports = mongoose.model('CommercialWork', commercialWorkSchema);
