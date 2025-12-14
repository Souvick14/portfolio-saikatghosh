// ============================================
// Achievements API Routes
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Achievement = require('../models/Achievement');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured for Achievement image uploads');
}

// Configure multer for Cloudinary upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/achievements',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// ============================================
// GET all achievements
// ============================================
router.get('/', async (req, res) => {
    try {
        const achievements = await Achievement.find()
            .sort({ order: 1, createdAt: -1 });
        
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// ============================================
// GET single achievement
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        
        res.json(achievement);
    } catch (error) {
        console.error('Error fetching achievement:', error);
        res.status(500).json({ error: 'Failed to fetch achievement' });
    }
});

// ============================================
// POST create new achievement
// ============================================
router.post('/', upload.single('achievementImage'), async (req, res) => {
    try {
        const { description, order, adminName, adminProfilePic } = req.body;
        
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Achievement image is required' });
        }
        
        const achievementData = {
            description: description.trim(),
            achievementImage: req.file.path,
            order: order ? parseInt(order) : 0
        };
        
        // Add admin profile if provided
        if (adminName) achievementData.adminName = adminName.trim();
        if (adminProfilePic) achievementData.adminProfilePic = adminProfilePic;
        
        const achievement = new Achievement(achievementData);
        await achievement.save();
        
        res.status(201).json({
            message: 'Achievement created successfully',
            achievement
        });
        
        console.log(`✅ Achievement created: ${achievement._id}`);
        
    } catch (error) {
        console.error('Error creating achievement:', error);
        
        // Delete uploaded file if database save fails
        // If using Cloudinary, we don't need to manually unlink local files
        // But if you wanted to delete from Cloudinary on error, you'd need the public_id
        
        res.status(500).json({ error: 'Failed to create achievement' });
    }
});

// ============================================
// PUT update achievement
// ============================================
router.put('/:id', upload.single('achievementImage'), async (req, res) => {
    try {
        const { description, order, adminName, adminProfilePic } = req.body;
        
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        
        // Update fields
        if (description) achievement.description = description.trim();
        if (order !== undefined) achievement.order = parseInt(order);
        if (adminName) achievement.adminName = adminName.trim();
        if (adminProfilePic) achievement.adminProfilePic = adminProfilePic;
        
        // Update image if new one uploaded
        if (req.file) {
            // Note: To delete the old image from Cloudinary, we would need its public_id
            // const publicId = ...;
            // await cloudinary.uploader.destroy(publicId);
            
            achievement.achievementImage = req.file.path;
        }
        
        await achievement.save();
        
        res.json({
            message: 'Achievement updated successfully',
            achievement
        });
        
        console.log(`✅ Achievement updated: ${achievement._id}`);
        
    } catch (error) {
        console.error('Error updating achievement:', error);
        res.status(500).json({ error: 'Failed to update achievement' });
    }
});

// ============================================
// DELETE achievement
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        
        // Delete image file
        // Note: To delete image from Cloudinary, we would need its public_id
        // await cloudinary.uploader.destroy(publicId);
        
        await Achievement.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Achievement deleted successfully' });
        
        console.log(`✅ Achievement deleted: ${req.params.id}`);
        
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({ error: 'Failed to delete achievement' });
    }
});

module.exports = router;
