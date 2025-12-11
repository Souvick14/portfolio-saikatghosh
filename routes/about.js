// ============================================
// About Section API Routes
// ============================================

const express = require('express');
const router = express.Router();
const AboutSection = require('../models/AboutSection');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/profile-images');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create unique filename: profile-timestamp.ext
        const uniqueName = 'profile-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max  
    },
    fileFilter: function(req, file, cb) {
        // Accept images only
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// GET about section
router.get('/', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            // Return default data when MongoDB is not connected
            return res.json({
                _id: 'about-section',
                heading: 'Bringing Stories to Life Through Video',
                content: `With over 5 years of experience in video editing and post-production, I specialize in transforming raw footage into compelling visual narratives. My passion lies in the art of storytelling through seamless edits, dynamic motion graphics, and stunning color grading.

I've worked with diverse clients ranging from indie musicians to corporate brands, always striving to deliver content that not only meets but exceeds expectations. Every project is an opportunity to push creative boundaries and explore new techniques.

When I'm not editing, you'll find me exploring new visual styles, experimenting with the latest editing software, or capturing footage for personal creative projects.`,
                statistics: {
                    projects: 150,
                    clients: 50,
                    experience: 5
                },
                profileImage: 'https://via.placeholder.com/400x500/764ba2/ffffff?text=Your+Photo',
                warning: 'MongoDB not connected. Configure MONGODB_URI in .env to enable database functionality.',
                fallback: true
            });
        }
        
        let about = await AboutSection.findById('about-section');
        
        // If no about section exists, create default
        if (!about) {
            about = new AboutSection({
                _id: 'about-section',
                heading: 'Bringing Stories to Life Through Video',
                content: `With over 5 years of experience in video editing and post-production, I specialize in transforming raw footage into compelling visual narratives. My passion lies in the art of storytelling through seamless edits, dynamic motion graphics, and stunning color grading.

I've worked with diverse clients ranging from indie musicians to corporate brands, always striving to deliver content that not only meets but exceeds expectations. Every project is an opportunity to push creative boundaries and explore new techniques.

When I'm not editing, you'll find me exploring new visual styles, experimenting with the latest editing software, or capturing footage for personal creative projects.`,
                statistics: {
                    projects: 150,
                    clients: 50,
                    experience: 5
                },
                profileImage: 'https://via.placeholder.com/400x500/764ba2/ffffff?text=Your+Photo'
            });
            await about.save();
        }
        
        res.json(about);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update about section (with optional file upload)
router.put('/', upload.single('profileImageFile'), async (req, res) => {
    try {
        const updateData = {
            heading: req.body.heading,
            content: req.body.content,
            statistics: JSON.parse(req.body.statistics || '{}')
        };

        // Handle profile image
        if (req.file) {
            // File was uploaded
            const fileUrl = `/uploads/profile-images/${req.file.filename}`;
            updateData.profileImage = fileUrl;
            
            console.log('✅ Profile image uploaded:', fileUrl);
        } else if (req.body.profileImage) {
            // URL was provided
            updateData.profileImage = req.body.profileImage;
            
            console.log('✅ Profile image URL saved:', req.body.profileImage);
        }

        const about = await AboutSection.findByIdAndUpdate(
            'about-section',
            updateData,
            { new: true, upsert: true, runValidators: true }
        );
        
        res.json(about);
    } catch (error) {
        console.error('Error updating about section:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
