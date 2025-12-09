// ============================================
// Skills API Routes
// ============================================

const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// GET all skills
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
        
        const skills = await Skill.find().sort({ order: 1, createdAt: -1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single skill
router.get('/:id', async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create skill
router.post('/', async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json(skill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update skill
router.put('/:id', async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json(skill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE skill
router.delete('/:id', async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
