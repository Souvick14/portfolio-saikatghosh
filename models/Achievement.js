// ============================================
// Achievement Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

/**
 * Achievement Schema
 * 
 * Stores achievement cards with admin profile info
 * Displayed in Instagram-style grid on main website
 */

const achievementSchema = new mongoose.Schema({
    // Admin Profile (global settings)
    adminName: {
        type: String,
        default: 'Admin',
        trim: true,
        maxlength: [100, 'Admin name cannot exceed 100 characters']
    },
    
    adminProfilePic: {
        type: String,
        default: '',
        trim: true
    },
    
    // Achievement Data
    achievementImage: {
        type: String,
        required: [true, 'Achievement image is required'],
        trim: true
    },
    
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient sorting
achievementSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
