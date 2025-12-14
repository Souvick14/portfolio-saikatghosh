// ============================================
// Client Work API Routes
// ============================================

const express = require('express');
const router = express.Router();
const ClientWork = require('../models/ClientWork');
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
    console.log('✅ Cloudinary configured for Client Work');
}

// Configure multer for Cloudinary upload (technology logos)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/client-work/logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB per logo
        files: 10 // Max 10 files
    },
    fileFilter: function(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|svg|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, SVG, WebP)'));
        }
    }
});

// GET all client work
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
        
        const clientWork = await ClientWork.find().sort({ order: 1, createdAt: -1 });
        res.json(clientWork);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single client work
router.get('/:id', async (req, res) => {
    try {
        const work = await ClientWork.findById(req.params.id);
        if (!work) {
            return res.status(404).json({ error: 'Client work not found' });
        }
        res.json(work);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create client work (with optional logo uploads)
router.post('/', upload.array('technologyLogos', 10), async (req, res) => {
    try {
        const workData = {
            youtubeUrl: req.body.youtubeUrl,
            brand: req.body.brand,
            title: req.body.title,
            description: req.body.description,
            engagement: req.body.engagement || '',
            revenue: req.body.revenue || '',
            genre: req.body.genre || 'Others',
            order: req.body.order || 0
        };

        // Add uploaded logo URLs
        if (req.files && req.files.length > 0) {
            workData.technologyLogos = req.files.map(file => file.path);
            console.log(`✅ Uploaded ${req.files.length} technology logos to Cloudinary`);
        }

        const work = new ClientWork(workData);
        await work.save();
        res.status(201).json(work);
    } catch (error) {
        console.error('Error creating client work:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT update client work (with optional logo uploads)
router.put('/:id', upload.array('technologyLogos', 10), async (req, res) => {
    try {
        const updateData = {
            youtubeUrl: req.body.youtubeUrl,
            brand: req.body.brand,
            title: req.body.title,
            description: req.body.description,
            engagement: req.body.engagement || '',
            revenue: req.body.revenue || '',
            genre: req.body.genre || 'Others',
            order: req.body.order || 0
        };

        // Handle logo uploads
        if (req.files && req.files.length > 0) {
            updateData.technologyLogos = req.files.map(file => file.path);
            console.log(`✅ Updated with ${req.files.length} technology logos`);
        } else if (req.body.technologyLogos) {
            // Parse existing logos if provided as JSON string
            updateData.technologyLogos = JSON.parse(req.body.technologyLogos);
        }

        const work = await ClientWork.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!work) {
            return res.status(404).json({ error: 'Client work not found' });
        }
        
        res.json(work);
    } catch (error) {
        console.error('Error updating client work:', error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE client work
router.delete('/:id', async (req, res) => {
    try {
        const work = await ClientWork.findByIdAndDelete(req.params.id);
        if (!work) {
            return res.status(404).json({ error: 'Client work not found' });
        }
        res.json({ message: 'Client work deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
