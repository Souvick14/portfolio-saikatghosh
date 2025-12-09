// ============================================
// Skill Model - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true
    },
    icon: {
        type: String,
        required: [true, 'Skill icon is required'],
        default: 'fas fa-code'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    proficiency: {
        type: Number,
        required: [true, 'Proficiency level is required'],
        min: 0,
        max: 100,
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    projects: [{
        type: String,
        trim: true
    }],
    backgroundImage: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
skillSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Skill', skillSchema);
