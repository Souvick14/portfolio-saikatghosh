// ============================================
// Instagram Reels API Routes
// ============================================

const express = require('express');
const router = express.Router();
const InstagramReel = require('../models/InstagramReel');
const mongoose = require('mongoose');

// GET all reels
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

// POST create reel
router.post('/', async (req, res) => {
    try {
        const reel = new InstagramReel(req.body);
        await reel.save();
        res.status(201).json(reel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update reel
router.put('/:id', async (req, res) => {
    try {
        const reel = await InstagramReel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!reel) {
            return res.status(404).json({ error: 'Reel not found' });
        }
        res.json(reel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE reel
router.delete('/:id', async (req, res) => {
    try {
        const reel = await InstagramReel.findByIdAndDelete(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: 'Reel not found' });
        }
        res.json({ message: 'Reel deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
