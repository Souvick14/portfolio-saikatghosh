// ============================================
// Contact Info Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
    // There should only be one contact info document
    _id: {
        type: String,
        default: 'contact-info'
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    socialMedia: {
        youtube: {
            type: String,
            trim: true,
            default: ''
        },
        instagram: {
            type: String,
            trim: true,
            default: ''
        },
        twitter: {
            type: String,
            trim: true,
            default: ''
        },
        linkedin: {
            type: String,
            trim: true,
            default: ''
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
