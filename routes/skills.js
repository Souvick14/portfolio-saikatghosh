const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Skill = require('../models/Skill');

// Configure Cloudinary only if credentials are provided
let cloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary configured for image uploads');
} else {
    console.warn('⚠️  Cloudinary credentials not found. Image uploads will be disabled.');
}

// Configure Multer with Cloudinary storage (or memory storage as fallback)
let storage;
let upload;

if (cloudinaryConfigured) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'portfolio/skills',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 800, height: 600, crop: 'limit' }],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `skill-${uniqueSuffix}`;
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

// GET all skills
router.get('/', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (!req.app.locals.mongoConnected) {
            return res.status(200).json([]);
        }

        const skills = await Skill.find().sort({ order: 1 });
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Error fetching skills', error: error.message });
    }
});

// GET single skill
router.get('/:id', async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        
        res.json(skill);
    } catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({ message: 'Error fetching skill', error: error.message });
    }
});

// POST new skill (with Cloudinary image upload)
router.post('/', upload.single('backgroundImage'), async (req, res) => {
    try {
        const skillData = {
            name: req.body.name,
            icon: req.body.icon,
            category: req.body.category,
            proficiency: parseInt(req.body.proficiency),
            description: req.body.description,
            projects: req.body.projects ? JSON.parse(req.body.projects) : [],
            order: req.body.order ? parseInt(req.body.order) : 0
        };

        // If file was uploaded to Cloudinary, save the URL
        if (req.file) {
            skillData.backgroundImage = req.file.path; // Cloudinary URL
        }

        const skill = new Skill(skillData);
        const savedSkill = await skill.save();
        
        res.status(201).json(savedSkill);
    } catch (error) {
        console.error('Error creating skill:', error);
        
        // If Cloudinary upload succeeded but skill creation failed, delete the image
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(`portfolio/skills/${req.file.filename}`);
            } catch (deleteError) {
                console.error('Error deleting orphaned image:', deleteError);
            }
        }
        
        res.status(400).json({ message: 'Error creating skill', error: error.message });
    }
});

// PUT update skill (with Cloudinary image upload)
router.put('/:id', upload.single('backgroundImage'), async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        // Update fields
        skill.name = req.body.name || skill.name;
        skill.icon = req.body.icon || skill.icon;
        skill.category = req.body.category || skill.category;
        skill.proficiency = req.body.proficiency ? parseInt(req.body.proficiency) : skill.proficiency;
        skill.description = req.body.description || skill.description;
        skill.projects = req.body.projects ? JSON.parse(req.body.projects) : skill.projects;
        skill.order = req.body.order !== undefined ? parseInt(req.body.order) : skill.order;

        // Handle image update
        if (req.file) {
            // Delete old Cloudinary image if it exists
            if (skill.backgroundImage) {
                try {
                    // Extract public_id from Cloudinary URL
                    const publicId = extractPublicId(skill.backgroundImage);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (deleteError) {
                    console.error('Error deleting old image:', deleteError);
                }
            }
            
            skill.backgroundImage = req.file.path; // New Cloudinary URL
        }

        const updatedSkill = await skill.save();
        res.json(updatedSkill);
    } catch (error) {
        console.error('Error updating skill:', error);
        
        // If Cloudinary upload succeeded but update failed, delete the new image
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(`portfolio/skills/${req.file.filename}`);
            } catch (deleteError) {
                console.error('Error deleting orphaned image:', deleteError);
            }
        }
        
        res.status(400).json({ message: 'Error updating skill', error: error.message });
    }
});

// DELETE skill
router.delete('/:id', async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        // Delete Cloudinary image if it exists
        if (skill.backgroundImage) {
            try {
                const publicId = extractPublicId(skill.backgroundImage);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (deleteError) {
                console.error('Error deleting image:', deleteError);
            }
        }

        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ message: 'Error deleting skill', error: error.message });
    }
});

// Helper function to extract public_id from Cloudinary URL
function extractPublicId(url) {
    try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
        const matches = url.match(/\/portfolio\/skills\/[^\/]+/);
        if (matches) {
            return matches[0].substring(1); // Remove leading slash
        }
        return null;
    } catch (error) {
        return null;
    }
}

module.exports = router;
