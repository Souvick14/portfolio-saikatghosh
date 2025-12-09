// ============================================
// About Section Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const aboutSectionSchema = new mongoose.Schema({
    // There should only be one about section document
    _id: {
        type: String,
        default: 'about-section'
    },
    heading: {
        type: String,
        trim: true,
        default: 'Bringing Stories to Life Through Video'
    },
    content: {
        type: String,
        required: [true, 'About content is required'],
        trim: true
    },
    statistics: {
        projects: {
            type: Number,
            default: 0
        },
        clients: {
            type: Number,
            default: 0
        },
        experience: {
            type: Number,
            default: 0
        }
    },
    profileImage: {
        type: String,
        trim: true,
        default: 'https://via.placeholder.com/400x500/764ba2/ffffff?text=Your+Photo'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AboutSection', aboutSectionSchema);
