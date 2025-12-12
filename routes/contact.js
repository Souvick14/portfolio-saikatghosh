// ============================================
// Contact API Routes
// ============================================

const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// GET contact info
router.get('/', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            // Return default data when MongoDB is not connected
            return res.json({
                _id: 'contact-info',
                email: 'hello@videoeditor.com',
                phone: '+1 (555) 123-4567',
                location: 'Los Angeles, CA',
                socialMedia: {
                    youtube: 'https://youtube.com/@yourchannel',
                    instagram: '',
                    twitter: '',
                    linkedin: '',
                    vimeo: ''
                },
                warning: 'MongoDB not connected. Configure MONGODB_URI in .env to enable database functionality.',
                fallback: true
            });
        }
        
        let contactInfo = await ContactInfo.findById('contact-info');
        
        // If no contact info exists, create default
        if (!contactInfo) {
            contactInfo = new ContactInfo({
                _id: 'contact-info',
                email: 'hello@videoeditor.com',
                phone: '+1 (555) 123-4567',
                location: 'Los Angeles, CA',
                socialMedia: {
                    youtube: '',
                    instagram: '',
                    twitter: '',
                    linkedin: ''
                }
            });
            await contactInfo.save();
        }
        
        res.json(contactInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update contact info
router.put('/', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findByIdAndUpdate(
            'contact-info',
            req.body,
            { new: true, upsert: true, runValidators: true }
        );
        res.json(contactInfo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST save contact form message to database
router.post('/messages', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'All fields are required',
                fields: { name, email, subject, message }
            });
        }
        
        // Create and save message
        const newMessage = new Message({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            isRead: false
        });
        
        await newMessage.save();
        
        res.status(201).json({ 
            success: true,
            message: 'Message received successfully! We\'ll get back to you soon.'
        });
        
        console.log(`✅ New message from ${name} (${email})`);
        
    } catch (error) {
        console.error('Error saving message:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to save message. Please try again.' 
        });
    }
});

// GET all messages (admin only)
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 }); // Newest first

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// PUT mark message as read
router.put('/messages/:id/read', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Toggle read status
        message.isRead = !message.isRead;
        await message.save();

        res.json({
            message: `Message marked as ${message.isRead ? 'read' : 'unread'}`,
            data: message
        });

    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// DELETE message
router.delete('/messages/:id', async (req, res) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete(req.params.id);

        if (!deletedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({
            message: 'Message deleted successfully',
            data: deletedMessage
        });

        console.log(`✅ Message ${deletedMessage._id} deleted`);

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
