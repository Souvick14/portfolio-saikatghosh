// ============================================
// Data Manager
// Handles data storage, retrieval, and mock data
// ============================================

class DataManager {
    constructor() {
        this.storageKey = 'portfolioData';
        this.initializeMockData();
    }

    // Initialize with mock data
    initializeMockData() {
        const stored = this.getData();
        if (!stored || Object.keys(stored).length === 0) {
            this.setData(this.getMockData());
        }
    }

    // Get mock data for demonstration
    getMockData() {
        return {
            instagramReels: [
                {
                    id: 1,
                    reelUrl: 'https://www.instagram.com/reel/C4mKQp7P8Qx/',
                    title: 'Latest Creative Reel',
                    timestamp: Date.now()
                },
                {
                    id: 2,
                    reelUrl: 'https://www.instagram.com/reel/C3tU5YwPj9k/',
                    title: 'Behind the Scenes',
                    timestamp: Date.now()
                },
                {
                    id: 3,
                    reelUrl: 'https://www.instagram.com/reel/C2hGx3fv1nH/',
                    title: 'Quick Tips & Tricks',
                    timestamp: Date.now()
                }
            ],
            reels: [
                {
                    id: 1,
                    videoId: 'dQw4w9WgXcQ', // Replace with actual YouTube video IDs
                    title: 'Day in My Life as a Creator',
                    views: '1.2M',
                    likes: '45K'
                },
                {
                    id: 2,
                    videoId: 'jNQXacGUZKU', // Replace with actual YouTube video IDs
                    title: 'Behind the Scenes',
                    views: '850K',
                    likes: '32K'
                },
                {
                    id: 3,
                    videoId: '3JZ_D3ELwOQ', // Replace with actual YouTube video IDs
                    title: 'Quick Tips for Creators',
                    views: '2.1M',
                    likes: '78K'
                }
            ],
            blogs: [
                {
                    id: 1,
                    title: 'How I Grew My Following to 1 Million',
                    excerpt: 'Discover the strategies and tactics that helped me build an engaged community of over 1 million followers across platforms...',
                    date: '2024-12-01',
                    image: 'https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Blog+Post+1',
                    link: '#'
                },
                {
                    id: 2,
                    title: 'The Secret to Viral Content',
                    excerpt: 'Learn the proven formula I use to create content that consistently reaches millions of views and drives massive engagement...',
                    date: '2024-11-28',
                    image: 'https://via.placeholder.com/600x400/06b6d4/ffffff?text=Blog+Post+2',
                    link: '#'
                },
                {
                    id: 3,
                    title: 'Monetization Strategies for Creators',
                    excerpt: 'From brand deals to digital products, explore the multiple revenue streams that turned my passion into a full-time career...',
                    date: '2024-11-25',
                    image: 'https://via.placeholder.com/600x400/ec4899/ffffff?text=Blog+Post+3',
                    link: '#'
                }
            ],
            commercial: [
                {
                    id: 1,
                    videoId: 'M7lc1UVf-VE', // Replace with actual YouTube video IDs
                    brand: 'TechCo',
                    title: 'Smartphone Launch Campaign',
                    description: 'High-energy promotional campaign for the latest smartphone featuring unboxing and lifestyle shots',
                    views: '3.5M',
                    engagement: '8.2%',
                    revenue: '$15K'
                },
                {
                    id: 2,
                    videoId: 'YQHsXMglC9A', // Replace with actual YouTube video IDs
                    brand: 'FashionBrand',
                    title: 'Summer Collection 2024',
                    description: 'Stylish lookbook showcasing the summer collection with vibrant visuals and trending music',
                    views: '2.1M',
                    engagement: '9.5%',
                    revenue: '$12K'
                },
                {
                    id: 3,
                    videoId: '9bZkp7q19f0', // Replace with actual YouTube video IDs
                    brand: 'FitnessApp',
                    title: 'Fitness App Testimonial',
                    description: 'Authentic review and transformation journey showcasing real results from the fitness app',
                    views: '1.8M',
                    engagement: '7.8%',
                    revenue: '$10K'
                }
            ],
            youtube: [
                {
                    id: 1,
                    videoId: 'dQw4w9WgXcQ',
                    title: 'Complete Beginner\'s Guide to Video Editing',
                    description: 'Learn the fundamentals of video editing from scratch with this comprehensive tutorial',
                    category: 'tutorial',
                    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                    order: 1
                },
                {
                    id: 2,
                    videoId: 'jNQXACUZKU',
                    title: 'Behind the Scenes: My Creative Process',
                    description: 'Take a look at how I approach video projects from concept to final export',
                    category: 'vlog',
                    thumbnailUrl: 'https://img.youtube.com/vi/jNQXACUZKU/maxresdefault.jpg',
                    order: 2
                },
                {
                    id: 3,
                    videoId: '3JZ_D3ELwOQ',
                    title: 'Advanced Color Grading Techniques',
                    description: 'Master professional color grading workflows to make your videos cinematic',
                    category: 'tutorial',
                    thumbnailUrl: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg',
                    order: 3
                }
            ],
            skills: [
                {
                    id: 1,
                    name: 'Adobe Premiere Pro',
                    icon: 'fas fa-film',
                    proficiency: 95,
                    category: 'Video Editing',
                    backgroundImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
                    projects: [
                        'Commercial campaign for TechCo - 3.5M views',
                        'Music video series - Featured on MTV',
                        'Documentary editing - Film festival selection'
                    ],
                    description: 'Expert-level video editing with advanced color grading, multi-cam editing, and cinematic storytelling techniques'
                },
                {
                    id: 2,
                    name: 'Adobe After Effects',
                    icon: 'fas fa-layer-group',
                    proficiency: 90,
                    category: 'Motion Graphics',
                    backgroundImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
                    projects: [
                        'Animated logo reveals for 15+ brands',
                        'Explainer video animations - 2M+ views',
                        'Motion graphics for broadcast television'
                    ],
                    description: 'Creating stunning motion graphics, visual effects, and animated compositions with complex expressions and plugins'
                },
                {
                    id: 3,
                    name: 'Adobe Photoshop',
                    icon: 'fas fa-image',
                    proficiency: 88,
                    category: 'Design',
                    backgroundImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
                    projects: [
                        'Thumbnail designs - 10M+ cumulative views',
                        'Social media graphics for major brands',
                        'Photo manipulation and compositing work'
                    ],
                    description: 'Professional photo editing, thumbnail creation, and graphic design for social media and marketing materials'
                },
                {
                    id: 4,
                    name: 'DaVinci Resolve',
                    icon: 'fas fa-palette',
                    proficiency: 85,
                    category: 'Color Grading',
                    backgroundImage: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
                    projects: [
                        'High-end color grading for commercials',
                        'Cinematic look development for short films',
                        'HDR grading for streaming content'
                    ],
                    description: 'Advanced color grading and correction using professional tools and techniques for cinematic results'
                },
                {
                    id: 5,
                    name: 'Sound Design',
                    icon: 'fas fa-music',
                    proficiency: 80,
                    category: 'Audio',
                    projects: [
                        'Audio mixing for 50+ video projects',
                        'Custom sound effects library creation',
                        'Podcast editing and mastering'
                    ],
                    description: 'Audio mixing, sound effects design, and music synchronization for immersive video experiences'
                },
                {
                    id: 6,
                    name: 'Cinema 4D',
                    icon: 'fas fa-cube',
                    proficiency: 75,
                    category: '3D Animation',
                    projects: [
                        '3D product visualizations for e-commerce',
                        'Animated 3D logos and text animations',
                        'Motion graphics integration in videos'
                    ],
                    description: '3D modeling, animation, and rendering for motion graphics and product visualization'
                }
            ]
        };
    }

    // Get all data from localStorage
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading data:', error);
            return {};
        }
    }

    // Set data to localStorage
    setData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Get data by category
    getByCategory(category) {
        const data = this.getData();
        return data[category] || [];
    }

    // Add item to category
    addItem(category, item) {
        const data = this.getData();
        if (!data[category]) {
            data[category] = [];
        }

        item.id = Date.now(); // Simple ID generation
        data[category].push(item);

        return this.setData(data);
    }

    // Update item in category
    updateItem(category, itemId, updates) {
        const data = this.getData();
        if (!data[category]) return false;

        const index = data[category].findIndex(item => item.id === itemId);
        if (index === -1) return false;

        data[category][index] = { ...data[category][index], ...updates };
        return this.setData(data);
    }

    // Delete item from category
    deleteItem(category, itemId) {
        const data = this.getData();
        if (!data[category]) return false;

        data[category] = data[category].filter(item => item.id !== itemId);
        return this.setData(data);
    }

    // Clear all data
    clearAll() {
        localStorage.removeItem(this.storageKey);
        this.initializeMockData();
    }

    // Reset to mock data
    resetToMock() {
        this.setData(this.getMockData());
    }
}

// Initialize global data manager
const dataManager = new DataManager();
