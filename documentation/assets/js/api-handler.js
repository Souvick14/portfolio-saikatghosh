// ============================================
// API Handler
// YouTube & Google Drive API Integration
// ============================================

class APIHandler {
    constructor() {
        this.useRealAPI = false; // Set to true when API keys are configured
        this.cache = new Map();
    }

    // Check if API keys are configured
    checkAPIConfig() {
        const hasYouTubeKey = CONFIG.youtube.apiKey !== 'YOUR_YOUTUBE_API_KEY_HERE';
        const hasGoogleDriveKey = CONFIG.googleDrive.apiKey !== 'YOUR_GOOGLE_DRIVE_API_KEY_HERE';
        this.useRealAPI = hasYouTubeKey && hasGoogleDriveKey;
        return this.useRealAPI;
    }

    // Fetch YouTube videos
    async fetchYouTubeVideos(category = 'all') {
        if (!this.useRealAPI) {
            // Return mock data
            return this.getMockYouTubeData(category);
        }

        try {
            const cacheKey = `youtube_${category}`;
            if (this.getCachedData(cacheKey)) {
                return this.getCachedData(cacheKey);
            }

            const url = `https://www.googleapis.com/youtube/v3/search?` +
                `key=${CONFIG.youtube.apiKey}&` +
                `channelId=${CONFIG.youtube.channelId}&` +
                `part=snippet,id&` +
                `order=date&` +
                `maxResults=${CONFIG.youtube.maxResults}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error('YouTube API Error:', data.error);
                return this.getMockYouTubeData(category);
            }

            const videos = data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                publishedAt: item.snippet.publishedAt
            }));

            this.setCachedData(cacheKey, videos);
            return videos;

        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            return this.getMockYouTubeData(category);
        }
    }

    // Get video statistics
    async getVideoStats(videoId) {
        if (!this.useRealAPI) {
            return {
                views: Math.floor(Math.random() * 5000000),
                likes: Math.floor(Math.random() * 100000),
                comments: Math.floor(Math.random() * 10000)
            };
        }

        try {
            const url = `https://www.googleapis.com/youtube/v3/videos?` +
                `key=${CONFIG.youtube.apiKey}&` +
                `id=${videoId}&` +
                `part=statistics`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.items && data.items[0]) {
                return {
                    views: parseInt(data.items[0].statistics.viewCount),
                    likes: parseInt(data.items[0].statistics.likeCount),
                    comments: parseInt(data.items[0].statistics.commentCount)
                };
            }
        } catch (error) {
            console.error('Error fetching video stats:', error);
        }

        return null;
    }

    // Fetch Google Drive images
    async fetchGoogleDriveImages() {
        if (!this.useRealAPI) {
            return this.getMockGoogleDriveImages();
        }

        try {
            const cacheKey = 'gdrive_images';
            if (this.getCachedData(cacheKey)) {
                return this.getCachedData(cacheKey);
            }

            const url = `https://www.googleapis.com/drive/v3/files?` +
                `key=${CONFIG.googleDrive.apiKey}&` +
                `q='${CONFIG.googleDrive.folderId}' in parents&` +
                `fields=files(id,name,thumbnailLink,webContentLink)`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error('Google Drive API Error:', data.error);
                return this.getMockGoogleDriveImages();
            }

            const images = data.files.map(file => ({
                id: file.id,
                name: file.name,
                thumbnail: file.thumbnailLink,
                url: file.webContentLink
            }));

            this.setCachedData(cacheKey, images);
            return images;

        } catch (error) {
            console.error('Error fetching Google Drive images:', error);
            return this.getMockGoogleDriveImages();
        }
    }

    // Mock data methods
    getMockYouTubeData(category) {
        return dataManager.getByCategory(category === 'reels' ? 'reels' : 'commercial');
    }

    getMockGoogleDriveImages() {
        return dataManager.getByCategory('blogs');
    }

    // Cache management
    getCachedData(key) {
        if (!CONFIG.cache.enabled) return null;

        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > CONFIG.cache.duration) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCachedData(key, data) {
        if (!CONFIG.cache.enabled) return;

        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Embed YouTube iframe
    createYouTubeEmbed(videoId, autoplay = false) {
        return `<iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}rel=0&modestbranding=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>`;
    }
}

// Initialize global API handler
const apiHandler = new APIHandler();
apiHandler.checkAPIConfig();
