// ============================================
// Genre Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

/**
 * Genre Schema
 * 
 * Stores video genres for Client Work and YouTube sections
 * Supports custom genres added by admin
 */

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Genre name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Genre name cannot exceed 50 characters']
    },
    
    category: {
        type: String,
        enum: ['clientWork', 'youtube', 'both'],
        default: 'both'
    },
    
    isDefault: {
        type: Boolean,
        default: false
    },
    
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
genreSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Genre', genreSchema);
