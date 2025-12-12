const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (should already be configured in main app)
// This uses the same config as other routes

// Configure multer for Cloudinary upload (user logos)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/ratings/logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
        transformation: [{ width: 100, height: 100, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// ============================================
// Public Routes (User-facing)
// ============================================

/**
 * GET /api/ratings/approved
 * Get all approved ratings for display on main website
 * Returns up to 30 most recent approved ratings
 */
router.get('/approved', async (req, res) => {
    try {
        const ratings = await Rating.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(30)
            .select('-adminNotes'); // Don't send admin notes to public

        res.json(ratings);
    } catch (error) {
        console.error('Error fetching approved ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

/**
 * POST /api/ratings
 * Public endpoint for users to submit ratings
 * Supports optional logo upload
 */
router.post('/', upload.single('userLogo'), async (req, res) => {
    try {
        const { userName, rating, description } = req.body;

        // Validation
        if (!userName || !rating || !description) {
            return res.status(400).json({ 
                error: 'User name, rating, and description are required' 
            });
        }

        // Create new rating
        const newRating = new Rating({
            userName: userName.trim(),
            userLogo: req.file ? req.file.path : '', // Cloudinary URL
            rating: parseInt(rating),
            description: description.trim(),
            isApproved: false // Default to not approved
        });

        await newRating.save();

        res.status(201).json({
            message: 'Thank you! Your rating has been submitted for review.',
            rating: newRating
        });

        console.log(`✅ New rating submitted by ${userName}`);

    } catch (error) {
        console.error('Error submitting rating:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to submit rating. Please try again.' 
        });
    }
});

// ============================================
// Admin Routes (Protected)
// ============================================

/**
 * GET /api/ratings
 * Get all ratings (admin only)
 * Returns both pending and approved ratings
 */
router.get('/', async (req, res) => {
    try {
        const ratings = await Rating.find()
            .sort({ createdAt: -1 });

        res.json(ratings);
    } catch (error) {
        console.error('Error fetching all ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

/**
 * GET /api/ratings/:id
 * Get single rating by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        
        if (!rating) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        res.json(rating);
    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ error: 'Failed to fetch rating' });
    }
});

/**
 * PUT /api/ratings/:id/approve
 * Toggle approval status of a rating
 */
router.put('/:id/approve', async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        
        if (!rating) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        // Toggle approval status
        rating.isApproved = !rating.isApproved;
        await rating.save();

        res.json({
            message: `Rating ${rating.isApproved ? 'approved' : 'unapproved'}`,
            rating
        });

        console.log(`✅ Rating ${rating._id} ${rating.isApproved ? 'approved' : 'unapproved'}`);

    } catch (error) {
        console.error('Error toggling approval:', error);
        res.status(500).json({ error: 'Failed to update approval status' });
    }
});

/**
 * PUT /api/ratings/:id
 * Update a rating (admin edit)
 */
router.put('/:id', upload.single('userLogo'), async (req, res) => {
    try {
        const { userName, rating, description, isApproved, adminNotes } = req.body;

        const updateData = {};
        
        if (userName) updateData.userName = userName.trim();
        if (rating) updateData.rating = parseInt(rating);
        if (description) updateData.description = description.trim();
        if (typeof isApproved !== 'undefined') updateData.isApproved = isApproved === 'true' || isApproved === true;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes.trim();
        
        // Handle logo upload
        if (req.file) {
            updateData.userLogo = req.file.path;
        }

        const updatedRating = await Rating.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedRating) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        res.json({
            message: 'Rating updated successfully',
            rating: updatedRating
        });

        console.log(`✅ Rating ${updatedRating._id} updated`);

    } catch (error) {
        console.error('Error updating rating:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to update rating' });
    }
});

/**
 * DELETE /api/ratings/:id
 * Delete a rating (admin only)
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedRating = await Rating.findByIdAndDelete(req.params.id);

        if (!deletedRating) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        res.json({
            message: 'Rating deleted successfully',
            rating: deletedRating
        });

        console.log(`✅ Rating ${deletedRating._id} deleted`);

    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ error: 'Failed to delete rating' });
    }
});

module.exports = router;
