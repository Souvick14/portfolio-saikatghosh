const mongoose = require('mongoose');

/**
 * Rating Schema
 * 
 * Represents user-submitted ratings that require admin approval before being displayed publicly.
 * Supports optional logo uploads via Cloudinary.
 */

const ratingSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        maxlength: [100, 'User name cannot exceed 100 characters']
    },
    
    userLogo: {
        type: String,
        default: '',
        trim: true,
        // Cloudinary URL for user/company logo
    },
    
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number'
        }
    },
    
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    isApproved: {
        type: Boolean,
        default: false,
        // Only approved ratings will be displayed on the main website
    },
    
    // Admin notes (optional, for internal use)
    adminNotes: {
        type: String,
        default: '',
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Index for efficient queries
ratingSchema.index({ isApproved: 1, createdAt: -1 });

// Virtual for star display (can be used in frontend)
ratingSchema.virtual('stars').get(function() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Ensure virtuals are included in JSON
ratingSchema.set('toJSON', { virtuals: true });
ratingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Rating', ratingSchema);
