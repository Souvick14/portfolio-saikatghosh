// ============================================
// Contact API Routes
// ============================================

const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

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

// POST send contact form email
router.post('/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'All fields are required',
                fields: { name, email, subject, message }
            });
        }
        
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email not configured. Form data:', { name, email, subject, message });
            return res.status(503).json({ 
                error: 'Email service not configured',
                message: 'Contact form received but email is not set up. Please configure EMAIL_USER and EMAIL_PASS in .env file.'
            });
        }
        
        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: process.env.CONTACT_FORM_TO || process.env.EMAIL_USER,
            replyTo: email,
            subject: `Portfolio Contact: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr/>
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr/>
                <p><small>Sent from Portfolio Contact Form</small></p>
            `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            message: error.message
        });
    }
});

module.exports = router;
