// ============================================
// Instagram Reels API Routes with Video Upload
// ============================================

const express = require('express');
const router = express.Router();
const InstagramReel = require('../models/InstagramReel');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary only if credentials are provided
let cloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary configured for reel video uploads');
} else {
    console.warn('⚠️  Cloudinary credentials not found. Video uploads will be disabled.');
}

// Configure Multer with Cloudinary storage for videos
let upload;

if (cloudinaryConfigured) {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'portfolio/reels',
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
            transformation: [{ width: 720, height: 1280, crop: 'limit' }],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `reel-${uniqueSuffix}`;
            }
        }
    });
    upload = multer({
        storage: storage,
        limits: { fileSize: 50 * 1024 * 1024 } // 50MB max for videos
    });
} else {
    upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 }
    });
}

// GET all reels
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                data: [],
                warning: 'MongoDB not connected',
                fallback: true
            });
        }
        
        const reels = await InstagramReel.find().sort({ order: 1, createdAt: -1 });
        res.json(reels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single reel
router.get('/:id', async (req, res) => {
    try {
        const reel = await InstagramReel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: 'Reel not found' });
        }
        res.json(reel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create reel with video upload
router.post('/', upload.single('videoFile'), async (req, res) => {
    try {
        const reelData = {
            reelUrl: req.body.reelUrl,
            title: req.body.title,
            technologies: req.body.technologies ? JSON.parse(req.body.technologies) : []
        };

        // Add video URL if file was uploaded
        if (req.file && req.file.path) {
            reelData.videoUrl = req.file.path;
        }

        const reel = new InstagramReel(reelData);
        await reel.save();
        res.status(201).json(reel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update reel with video upload
router.put('/:id', upload.single('videoFile'), async (req, res) => {
    try {
        const reel = await InstagramReel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: 'Reel not found' });
        }

        // Delete old video from Cloudinary if new video is uploaded
        if (req.file && reel.videoUrl && cloudinaryConfigured) {
            try {
                const publicId = reel.videoUrl.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            } catch (err) {
                console.error('Error deleting old video:', err);
            }
        }

        const updateData = {
            reelUrl: req.body.reelUrl,
            title: req.body.title,
            technologies: req.body.technologies ? JSON.parse(req.body.technologies) : []
        };

        if (req.file && req.file.path) {
            updateData.videoUrl = req.file.path;
        }

        const updatedReel = await InstagramReel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedReel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE reel
router.delete('/:id', async (req, res) => {
    try {
        const reel = await InstagramReel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: 'Reel not found' });
        }

        // Delete video from Cloudinary
        if (reel.videoUrl && cloudinaryConfigured) {
            try {
                const publicId = reel.videoUrl.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            } catch (err) {
                console.error('Error deleting video:', err);
            }
        }

        await InstagramReel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reel deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
