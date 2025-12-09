// ============================================
// Express.js Server - Portfolio Backend
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS Configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files (serve documentation folder)
app.use(express.static('documentation'));

// Request Logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// MongoDB Connection
// ============================================

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MongoDB URI not configured. Running in development mode with mock data.');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️  Continuing without database. API will use fallback data.');
    }
};

// ============================================
// API Routes
// ============================================

// Import routes
const skillsRoutes = require('./routes/skills');
const reelsRoutes = require('./routes/reels');
const commercialRoutes = require('./routes/commercial');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');

// Use routes
app.use('/api/skills', skillsRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/commercial', commercialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/about', aboutRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Portfolio API Server',
        version: '1.0.0',
        endpoints: {
            skills: '/api/skills',
            reels: '/api/reels',
            commercial: '/api/commercial',
            contact: '/api/contact',
            about: '/api/about',
            health: '/api/health'
        }
    });
});

// ============================================
// Error Handling
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Start Server
// ============================================

const startServer = async () => {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
        console.log('============================================');
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📁 Serving static files from /documentation`);
        console.log(`🔗 API available at http://localhost:${PORT}/api`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('============================================');
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Start the server
startServer();

module.exports = app;
