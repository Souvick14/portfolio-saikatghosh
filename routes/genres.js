// ============================================
// Genre API Routes
// ============================================

const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');

// ============================================
// GET all genres or by category
// ============================================
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = {};
        if (category && ['clientWork', 'youtube', 'both'].includes(category)) {
            query = {
                $or: [
                    { category: category },
                    { category: 'both' }
                ]
            };
        }
        
        const genres = await Genre.find(query).sort({ order: 1, name: 1 });
        
        res.json(genres);
        
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

// ============================================
// GET single genre
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        
        if (!genre) {
            return res.status(404).json({ error: 'Genre not found' });
        }
        
        res.json(genre);
        
    } catch (error) {
        console.error('Error fetching genre:', error);
        res.status(500).json({ error: 'Failed to fetch genre' });
    }
});

// ============================================
// POST create new genre
// ============================================
router.post('/', async (req, res) => {
    try {
        const { name, category } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Genre name is required' });
        }
        
        // Check if genre already exists (case-insensitive)
        const existingGenre = await Genre.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        
        if (existingGenre) {
            return res.status(400).json({ 
                error: 'Genre already exists',
                genre: existingGenre 
            });
        }
        
        const genreData = {
            name: name.trim(),
            category: category || 'both',
            isDefault: false
        };
        
        const genre = new Genre(genreData);
        await genre.save();
        
        res.status(201).json({
            message: 'Genre created successfully',
            genre
        });
        
        console.log(`✅ Genre created: ${genre.name}`);
        
    } catch (error) {
        console.error('Error creating genre:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Genre already exists' });
        }
        
        res.status(500).json({ error: 'Failed to create genre' });
    }
});

// ============================================
// DELETE genre (only custom genres)
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        
        if (!genre) {
            return res.status(404).json({ error: 'Genre not found' });
        }
        
        if (genre.isDefault) {
            return res.status(403).json({ error: 'Cannot delete default genres' });
        }
        
        await Genre.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Genre deleted successfully' });
        
        console.log(`✅ Genre deleted: ${genre.name}`);
        
    } catch (error) {
        console.error('Error deleting genre:', error);
        res.status(500).json({ error: 'Failed to delete genre' });
    }
});

// ============================================
// Initialize default genres
// ============================================
router.post('/initialize-defaults', async (req, res) => {
    try {
        const defaultGenres = [
            { name: 'Motion Graphics', category: 'both', isDefault: true, order: 1 },
            { name: 'Commercial', category: 'both', isDefault: true, order: 2 },
            { name: 'Others', category: 'both', isDefault: true, order: 999 }
        ];
        
        for (const genreData of defaultGenres) {
            const existing = await Genre.findOne({ name: genreData.name });
            if (!existing) {
                const genre = new Genre(genreData);
                await genre.save();
                console.log(`✅ Default genre created: ${genre.name}`);
            }
        }
        
        res.json({ message: 'Default genres initialized' });
        
    } catch (error) {
        console.error('Error initializing default genres:', error);
        res.status(500).json({ error: 'Failed to initialize default genres' });
    }
});

module.exports = router;
