// ============================================
// YouTube Videos API Routes
// ============================================

const express = require('express');
const router = express.Router();
const YouTubeVideo = require('../models/YouTubeVideo');
const mongoose = require('mongoose');

// GET all YouTube videos
router.get('/', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                data: [],
                warning: 'MongoDB not connected. Configure MONGODB_URI in .env to enable database functionality.',
                fallback: true
            });
        }
        
        const videos = await YouTubeVideo.find().sort({ order: 1, createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single YouTube video
router.get('/:id', async (req, res) => {
    try {
        const video = await YouTubeVideo.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create YouTube video
router.post('/', async (req, res) => {
    try {
        const video = new YouTubeVideo(req.body);
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update YouTube video
router.put('/:id', async (req, res) => {
    try {
        const video = await YouTubeVideo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE YouTube video
router.delete('/:id', async (req, res) => {
    try {
        const video = await YouTubeVideo.findByIdAndDelete(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
