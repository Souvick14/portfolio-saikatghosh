// ============================================
// Configuration File
// API Keys & Settings
// ============================================

const CONFIG = {
    // YouTube API Configuration
    youtube: {
        apiKey: 'YOUR_YOUTUBE_API_KEY_HERE', // Replace with your actual API key
        channelId: 'YOUR_CHANNEL_ID_HERE',    // Replace with your channel ID
        playlistId: '', // Optional: specific playlist ID
        maxResults: 10
    },

    // Google Drive API Configuration
    googleDrive: {
        apiKey: 'YOUR_GOOGLE_DRIVE_API_KEY_HERE', // Replace with your actual API key
        folderId: 'YOUR_BLOG_IMAGES_FOLDER_ID',    // Replace with your folder ID
        maxResults: 10
    },

    // Carousel Settings
    carousel: {
        autoPlay: true,
        intervalDuration: 5000, // 5 seconds
        transitionDuration: 500, // 0.5 seconds
        pauseOnHover: true,
        enableSwipe: true
    },

    // Cache Settings
    cache: {
        duration: 3600000, // 1 hour in milliseconds
        enabled: true
    },

    // Content Categories
    categories: {
        reels: 'reels',
        blogs: 'blogs',
        commercial: 'commercial'
    },

    // Admin Panel
    admin: {
        // WARNING: This is for demo purposes only!
        // In production, use proper backend authentication
        username: 'admin',
        password: 'admin123', // Change this!
        sessionDuration: 3600000 // 1 hour
    },

    // API Endpoints (for future backend integration)
    api: {
        baseUrl: '/api', // Update with your backend URL
        endpoints: {
            getReels: '/reels',
            getBlogs: '/blogs',
            getCommercial: '/commercial',
            addProject: '/projects/add',
            updateProject: '/projects/update',
            deleteProject: '/projects/delete'
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
