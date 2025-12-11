// ============================================
// About Section API Routes
// ============================================

const express = require('express');
const router = express.Router();
const AboutSection = require('../models/AboutSection');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (if credentials are provided)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured for About section');
}

// Configure multer for Cloudinary upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/about',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 500, height: 625, crop: 'limit' }]
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
        const extname = allowedTypes.test(file.originalname.toLowerCase());
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
            // Cloudinary file was uploaded - use the secure URL
            updateData.profileImage = req.file.path; // Cloudinary URL
            
            console.log('✅ Profile image uploaded to Cloudinary:', req.file.path);
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
