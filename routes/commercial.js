// ============================================
// Commercial Work API Routes
// ============================================

const express = require('express');
const router = express.Router();
const CommercialWork = require('../models/CommercialWork');
const axios = require('axios');
const mongoose = require('mongoose');

// GET all commercial work
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
        
        const commercial = await CommercialWork.find().sort({ order: 1, createdAt: -1 });
        res.json(commercial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single commercial work
router.get('/:id', async (req, res) => {
    try {
        const work = await CommercialWork.findById(req.params.id);
        if (!work) {
            return res.status(404).json({ error: 'Commercial work not found' });
        }
        res.json(work);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET YouTube video metadata
router.post('/youtube-metadata', async (req, res) => {
    try {
        const { videoId } = req.body;
        
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        
        if (!process.env.YOUTUBE_API_KEY) {
            return res.status(503).json({ 
                error: 'YouTube API key not configured',
                message: 'Please add YOUTUBE_API_KEY to your .env file'
            });
        }
        
        // Fetch video details from YouTube API
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet,statistics,contentDetails',
                id: videoId,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        
        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        const video = response.data.items[0];
        const metadata = {
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            viewCount: parseInt(video.statistics.viewCount).toLocaleString(),
            publishedAt: video.snippet.publishedAt,
            duration: video.contentDetails.duration
        };
        
        res.json(metadata);
    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch YouTube metadata',
            message: error.response?.data?.error?.message || error.message
        });
    }
});

// POST create commercial work
router.post('/', async (req, res) => {
    try {
        const work = new CommercialWork(req.body);
        await work.save();
        res.status(201).json(work);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update commercial work
router.put('/:id', async (req, res) => {
    try {
        const work = await CommercialWork.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!work) {
            return res.status(404).json({ error: 'Commercial work not found' });
        }
        res.json(work);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE commercial work
router.delete('/:id', async (req, res) => {
    try {
        const work = await CommercialWork.findByIdAndDelete(req.params.id);
        if (!work) {
            return res.status(404).json({ error: 'Commercial work not found' });
        }
        res.json({ message: 'Commercial work deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
