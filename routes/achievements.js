// ============================================
// Achievements API Routes
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Achievement = require('../models/Achievement');

// Configure multer for achievement image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/achievements');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'achievement-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
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
            achievementImage: `/uploads/achievements/${req.file.filename}`,
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
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads/achievements', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
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
            // Delete old image
            const oldImagePath = path.join(__dirname, '..', achievement.achievementImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            
            achievement.achievementImage = `/uploads/achievements/${req.file.filename}`;
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
        const imagePath = path.join(__dirname, '..', achievement.achievementImage);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        await Achievement.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Achievement deleted successfully' });
        
        console.log(`✅ Achievement deleted: ${req.params.id}`);
        
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({ error: 'Failed to delete achievement' });
    }
});

module.exports = router;
