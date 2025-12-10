const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
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
    console.log('✅ Cloudinary configured for blog image uploads');
} else {
    console.warn('⚠️  Cloudinary credentials not found. Blog image uploads will be disabled.');
}

// Configure Multer with Cloudinary storage (or memory storage as fallback)
let storage;
let upload;

if (cloudinaryConfigured) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'portfolio/blogs',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, height: 630, crop: 'limit' }],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `blog-${uniqueSuffix}`;
            }
        }
    });
    upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }
    });
} else {
    // Fallback: use memory storage (images won't be saved)
    upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 }
    });
}

// GET all blogs
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
        
        const blogs = await Blog.find({ published: true })
            .sort({ publishDate: -1, order: 1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new blog (with image upload)
router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const blogData = {
            title: req.body.title,
            content: req.body.content,
            excerpt: req.body.excerpt,
            category: req.body.category,
            tags: req.body.tags ? JSON.parse(req.body.tags) : [],
            author: req.body.author,
            publishDate: req.body.publishDate,
            order: req.body.order || 0,
            published: req.body.published !== 'false'
        };

        // If file was uploaded to Cloudinary, save the URL
        if (req.file && req.file.path) {
            blogData.coverImage = req.file.path; // Cloudinary URL
        }

        const blog = new Blog(blogData);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update blog
router.put('/:id', upload.single('coverImage'), async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            content: req.body.content,
            excerpt: req.body.excerpt,
            category: req.body.category,
            tags: req.body.tags ? JSON.parse(req.body.tags) : [],
            author: req.body.author,
            publishDate: req.body.publishDate,
            order: req.body.order,
            published: req.body.published !== 'false'
        };

        // Handle new cover image upload
        if (req.file && req.file.path) {
            updateData.coverImage = req.file.path; // Cloudinary URL
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE blog
router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
