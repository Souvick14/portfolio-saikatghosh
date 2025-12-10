// ============================================
// Blog API Routes
// ============================================

const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const mongoose = require('mongoose');
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinary');

// Configure multer for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

        // Handle cover image upload
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer, 'blogs');
                blogData.coverImage = result.secure_url;
            } catch (uploadError) {
                console.warn('Image upload failed, using default:', uploadError.message);
            }
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
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer, 'blogs');
                updateData.coverImage = result.secure_url;
            } catch (uploadError) {
                console.warn('Image upload failed:', uploadError.message);
            }
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
