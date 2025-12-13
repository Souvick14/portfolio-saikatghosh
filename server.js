// ============================================
// Express.js Server - Portfolio Backend
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

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

// Serve static files from documentation folder
app.use(express.static(path.join(__dirname, 'documentation')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
            app.locals.mongoConnected = false;
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // CRITICAL: Set flag so GET routes return data!
        app.locals.mongoConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️  Continuing without database. API will use fallback data.');
        app.locals.mongoConnected = false;
    }
};

// ============================================
// API Routes
// ============================================

// Import routes
const skillsRoutes = require('./routes/skills');
const reelsRoutes = require('./routes/reels');
const youtubeRoutes = require('./routes/youtube');
const blogsRoutes = require('./routes/blogs');
const clientWorkRoutes = require('./routes/client-work');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');
const ratingsRoutes = require('./routes/ratings');
const achievementsRoutes = require('./routes/achievements');
const genresRoutes = require('./routes/genres');

// Use routes
app.use('/api/skills', skillsRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/client-work', clientWorkRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/genres', genresRoutes);

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
            youtube: '/api/youtube',
            blogs: '/api/blogs',
            clientWork: '/api/client-work',
            contact: '/api/contact',
            about: '/api/about',
            ratings: '/api/ratings',
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
