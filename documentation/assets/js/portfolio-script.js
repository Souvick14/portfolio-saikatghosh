// ============================================
// Dynamic Influencer Portfolio - Main Script
// Loading Animations, Carousels, and Interactions
// ============================================

// ============================================
// Loading Screen
// ============================================
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.progressFill = document.getElementById('progressFill');
        this.loadingPercentage = document.getElementById('loadingPercentage');
        this.progress = 0;
    }

    start() {
        this.simulateLoading();
    }

    simulateLoading() {
        const duration = 3000; // 3 seconds
        const interval = 50;
        const increment = (interval / duration) * 100;

        const timer = setInterval(() => {
            this.progress += increment;

            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(timer);
                setTimeout(() => this.hide(), 300);
            }

            if (this.loadingPercentage) {
                this.loadingPercentage.textContent = Math.floor(this.progress) + '%';
            }
        }, interval);
    }

    hide() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            // Initialize carousels after loading
            setTimeout(() => {
                initializeCarousels();
            }, 500);
        }
    }
}

// ============================================
// Carousel Controller
// ============================================
class CarouselController {
    constructor(containerId, category) {
        this.container = document.getElementById(containerId);
        this.wrapper = this.container.querySelector('.carousel-wrapper');
        this.category = category;
        this.currentIndex = 0;
        this.slides = [];
        this.autoPlayInterval = null;
        this.isPlaying = false;

        this.prevBtn = this.container.querySelector('.prev-arrow');
        this.nextBtn = this.container.querySelector('.next-arrow');
        this.dotsContainer = this.container.querySelector('.carousel-dots');

        this.init();
    }

    async init() {
        await this.loadContent();
        this.setupNavigation();
        if (CONFIG.carousel.autoPlay) {
            this.startAutoPlay();
        }
        this.setupSwipeGestures();
        this.setupHoverPause();
    }

    async loadContent() {
        try {
            let data;

            if (this.category === 'reels') {
                data = await apiHandler.fetchYouTubeVideos('reels');
                this.renderReels(data);
            } else if (this.category === 'blogs') {
                data = dataManager.getByCategory('blogs');
                this.renderBlogs(data);
            } else if (this.category === 'commercial') {
                // Fetch commercial work from API
                try {
                    const response = await fetch('/api/commercial');
                    if (response.ok) {
                        data = await response.json();
                        if (!Array.isArray(data)) data = data.data || [];
                    } else {
                        data = [];
                    }
                } catch (error) {
                    console.error('Error fetching commercial work from API:', error);
                    data = [];
                }
                this.renderCommercial(data);
            }

            this.slides = this.wrapper.querySelectorAll('.carousel-slide');
            this.createDots();
            this.updateNavigation();

        } catch (error) {
            console.error(`Error loading ${this.category} content:`, error);
            this.showError();
        }
    }

    renderReels(reels) {
        this.wrapper.innerHTML = '';
        reels.forEach(reel => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide reels-slide';
            slide.innerHTML = apiHandler.createYouTubeEmbed(reel.videoId);
            this.wrapper.appendChild(slide);
        });
    }

    renderBlogs(blogs) {
        this.wrapper.innerHTML = '';
        blogs.forEach(blog => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide blog-slide';
            slide.innerHTML = `
                <div class="blog-image">
                    <img src="${blog.image}" alt="${blog.title}">
                </div>
                <div class="blog-content">
                    <div class="blog-date">${this.formatDate(blog.date)}</div>
                    <h3 class="blog-title">${blog.title}</h3>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <a href="${blog.link}" class="blog-link">Read More</a>
                </div>
            `;
            this.wrapper.appendChild(slide);
        });
    }

    renderCommercial(commercials) {
        this.wrapper.innerHTML = '';
        commercials.forEach(commercial => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide commercial-slide';
            slide.innerHTML = `
                <div class="commercial-video">
                    ${apiHandler.createYouTubeEmbed(commercial.videoId)}
                </div>
                <div class="commercial-info">
                    <div class="commercial-brand">${commercial.brand}</div>
                    <h3 class="commercial-title">${commercial.title}</h3>
                    <p class="commercial-description">${commercial.description}</p>
                    <div class="commercial-stats">
                        <div class="stat">
                            <div class="stat-value">${commercial.views}</div>
                            <div class="stat-label">Views</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${commercial.engagement}</div>
                            <div class="stat-label">Engagement</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${commercial.revenue}</div>
                            <div class="stat-label">Revenue</div>
                        </div>
                    </div>
                </div>
            `;
            this.wrapper.appendChild(slide);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    setupNavigation() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }

    createDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    updateNavigation() {
        // Update dots
        const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
        dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        // Update arrows
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;
        }
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;

        this.currentIndex = index;
        const offset = -index * 100;
        this.wrapper.style.transform = `translateX(${offset}%)`;
        this.updateNavigation();
    }

    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        } else if (CONFIG.carousel.autoPlay) {
            this.goToSlide(0); // Loop back to start
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    startAutoPlay() {
        this.stopAutoPlay(); // Clear any existing interval
        this.isPlaying = true;
        this.container.classList.add('playing');

        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, CONFIG.carousel.intervalDuration);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.isPlaying = false;
        this.container.classList.remove('playing');
        this.container.classList.add('paused');
    }

    setupHoverPause() {
        if (!CONFIG.carousel.pauseOnHover) return;

        this.container.addEventListener('mouseenter', () => {
            if (this.isPlaying) {
                this.stopAutoPlay();
            }
        });

        this.container.addEventListener('mouseleave', () => {
            if (CONFIG.carousel.autoPlay) {
                this.startAutoPlay();
            }
        });
    }

    setupSwipeGestures() {
        if (!CONFIG.carousel.enableSwipe) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.container.classList.add('swiping');
        });

        this.container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });

        this.container.addEventListener('touchend', () => {
            if (!isDragging) return;

            const diff = startX - currentX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }

            isDragging = false;
            this.container.classList.remove('swiping');
        });
    }

    showError() {
        this.wrapper.innerHTML = `
            <div class="carousel-empty">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load content. Please try again later.</p>
            </div>
        `;
    }
}

// ============================================
// Instagram Reels Carousel Controller
// Horizontal Scrolling Card Layout
// ============================================
class InstagramReelsCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.wrapper = this.container.querySelector('.instagram-carousel-wrapper');
        this.dotsContainer = document.getElementById('instagramReelsDots');
        this.currentIndex = 0;
        this.slides = [];
        
        // Drag scroll variables
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadInstagramReels();
        // Drag scroll functionality now handled per-row in createCarouselRow
    }
    

    
    async loadInstagramReels() {
        try {
            // Fetch reels from backend API
            const response = await fetch('/api/reels');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let reels = await response.json();
            
            // Handle fallback data structure from API
            if (!Array.isArray(reels)) {
                if (reels.data) {
                    reels = reels.data;
                } else {
                    reels = [];
                }
            }
            
            if (!reels || reels.length === 0) {
                this.showEmpty();
                return;
            }
            
            this.allReels = reels;
            this.displayedReels = reels.length > 40 ? reels.slice(0, 40) : reels;
            
            await this.renderReels(this.displayedReels);
            
            // Show "Show More" button if more than 40 cards
            if (reels.length > 40) {
                this.showMoreButton();
            }
            
        } catch (error) {
            console.error('Error loading Instagram reels from API:', error);
            this.showError();
        }
    }
    
    async renderReels(reels) {
        this.container.innerHTML = ''; // Clear container
        
        const CARDS_PER_ROW = 15;
        const rows = [];
        
        // Split reels into rows of 15
        for (let i = 0; i < reels.length; i += CARDS_PER_ROW) {
            rows.push(reels.slice(i, i + CARDS_PER_ROW));
        }
        
        // Create each row
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const rowReels = rows[rowIndex];
            const isReverse = rowIndex % 2 === 1; // Alternate direction
            
            await this.createCarouselRow(rowReels, rowIndex, isReverse);
        }
    }
    
    async createCarouselRow(reels, rowIndex, isReverse) {
        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'instagram-carousel-wrapper';
        rowWrapper.dataset.rowIndex = rowIndex;
        
        // Variables for drag scrolling
        let isDragging = false;
        let startX;
        let scrollStartPos = 0;
        let animationId;
        
        // Create slides - duplicate reels for seamless infinite loop
        const duplicateCount = 3; // Create 3 copies for smooth infinite effect
        const allReels = [];
        for (let i = 0; i < duplicateCount; i++) {
            allReels.push(...reels);
        }
        
        for (const reel of allReels) {
            const slide = await this.createReelSlide(reel);
            rowWrapper.appendChild(slide);
        }
        
        // Seamless infinite scroll animation
        // Calculate initial position to ensure cards start visible
        const slideWidth = 320 + 24; // card width + gap  
        const singleSetWidth = reels.length * slideWidth;
        
        // Start from middle set for left-scrolling, start of second set for right-scrolling
        // This ensures cards are visible from the start
        let position = isReverse ? 0 : -singleSetWidth;
        
        const speed = isReverse ? 50 : -50; // pixels per second (negative = left, positive = right)
        let isAnimating = true;
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            if (!isAnimating) {
                animationId = requestAnimationFrame(animate);
                return;
            }
            
            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;
            
            position += speed * deltaTime;
            
            // Reset position for seamless loop
            if (speed < 0 && position <=-singleSetWidth * 2) {
                position += singleSetWidth;
            } else if (speed > 0 && position >= 0) {
                position -= singleSetWidth;
            }
            
            rowWrapper.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animationId = requestAnimationFrame(animate);
        
        // Hover to pause
        rowWrapper.addEventListener('mouseenter', () => {
            isAnimating = false;
            rowWrapper.classList.add('paused');
        });
        
        rowWrapper.addEventListener('mouseleave', () => {
            if (!isDragging) {
                isAnimating = true;
                lastTime = performance.now(); // Reset time to prevent jump
                rowWrapper.classList.remove('paused');
            }
        });
        
        // Drag to scroll functionality
        const startDragging = (clientX) => {
            isDragging = true;
            isAnimating = false;
            startX = clientX;
            scrollStartPos = position;
            rowWrapper.classList.add('dragging');
        };
        
        const whileDragging = (clientX) => {
            if (!isDragging) return;
            const diff = clientX - startX;
            position = scrollStartPos + diff;
        };
        
        const stopDragging = () => {
            isDragging = false;
            rowWrapper.classList.remove('dragging');
            
            // Resume animation after a short delay
            setTimeout(() => {
                if (!rowWrapper.matches(':hover')) {
                    isAnimating = true;
                    lastTime = performance.now();
                    rowWrapper.classList.remove('paused');
                }
            }, 100);
        };
        
        // Mouse events
        rowWrapper.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDragging(e.clientX);
        });
        
        rowWrapper.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                whileDragging(e.clientX);
            }
        });
        
        rowWrapper.addEventListener('mouseup', stopDragging);
        rowWrapper.addEventListener('mouseleave', () => {
            if (isDragging) stopDragging();
        });
        
        // Touch events for mobile
        rowWrapper.addEventListener('touchstart', (e) => {
            startDragging(e.touches[0].clientX);
        });
        
        rowWrapper.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                whileDragging(e.touches[0].clientX);
            }
        });
        
        rowWrapper.addEventListener('touchend', stopDragging);
        
        this.container.appendChild(rowWrapper);
    }
    
    showMoreButton() {
        const showMoreContainer = document.createElement('div');
        showMoreContainer.className = 'show-more-container';
        showMoreContainer.innerHTML = `
            <button class="show-more-btn">
                <i class="fas fa-chevron-down"></i>
                <span>Show More Reels</span>
            </button>
        `;
        
        const button = showMoreContainer.querySelector('.show-more-btn');
        button.addEventListener('click', () => {
            this.displayedReels = this.allReels;
            this.renderReels(this.allReels);
            showMoreContainer.remove();
        });
        
        this.container.appendChild(showMoreContainer);
    }
    
    async createReelSlide(reel) {
        const slide = document.createElement('div');
        slide.className = 'instagram-carousel-slide';
        
        // Create flip card structure
        const flipCardInner = document.createElement('div');
        flipCardInner.className = 'reel-flip-card-inner';
        
        // Front face - Video or Link Card
        const frontFace = document.createElement('div');
        frontFace.className = 'reel-card-front';
        
        // Check if video was uploaded
        if (reel.videoUrl) {
            // Show uploaded video
            frontFace.innerHTML = `
                <div class="reel-video-container">
                    <video 
                        class="reel-video-player"
                        autoplay 
                        loop 
                        muted 
                        playsinline
                        preload="metadata">
                        <source src="${reel.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <button class="visit-reel-btn" data-url="${reel.reelUrl}">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Visit Reel</span>
                </button>
                <button class="flip-button" aria-label="Show technologies">
                    <i class="fas fa-info-circle"></i>
                </button>
            `;
        } else {
            // Show link card (no video uploaded)
            let platform = 'video';
            let platformIcon = 'fas fa-play-circle';
            let platformColor = '#8b5cf6';
            
            if (reel.reelUrl.includes('instagram.com')) {
                platform = 'Instagram';
                platformIcon = 'fab fa-instagram';
                platformColor = '#E4405F';
            } else if (reel.reelUrl.includes('youtube.com') || reel.reelUrl.includes('youtu.be')) {
                platform = 'YouTube';
                platformIcon = 'fab fa-youtube';
                platformColor = '#FF0000';
            } else if (reel.reelUrl.includes('drive.google.com')) {
                platform = 'Google Drive';
                platformIcon = 'fab fa-google-drive';
                platformColor = '#4285F4';
            }
            
            const displayTitle = reel.title || `${platform} Reel`;
            
            frontFace.innerHTML = `
                <div class="reel-link-card">
                    <div class="reel-platform-badge" style="color: ${platformColor}">
                        <i class="${platformIcon}"></i>
                        <span>${platform}</span>
                    </div>
                    <div class="reel-content">
                        <h3 class="reel-title">${displayTitle}</h3>
                    </div>
                    <button class="visit-reel-btn" data-url="${reel.reelUrl}">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Visit Reel</span>
                    </button>
                    <button class="flip-button" aria-label="Show technologies">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            `;
        }
        
        // Back face - Technologies used
        const backFace = document.createElement('div');
        backFace.className = 'reel-card-back';
        
        const technologies = reel.technologies &&reel.technologies.length > 0 
            ? reel.technologies 
            : ['Adobe Premiere Pro', 'After Effects'];
        
        backFace.innerHTML = `
            <button class="flip-back-button" aria-label="Flip back">
                <i class="fas fa-undo"></i>
            </button>
            <h3><i class="fas fa-tools"></i> Technologies Used</h3>
            <ul class="reel-tech-list">
                ${technologies.map(tech => `<li><i class="fas fa-check-circle" style="color: var(--primary-cyan); margin-right: 0.5rem;"></i>${tech}</li>`).join('')}
            </ul>
        `;
        
        flipCardInner.appendChild(frontFace);
        flipCardInner.appendChild(backFace);
        slide.appendChild(flipCardInner);
        
        // Add "Visit Reel" button click listener
        const visitBtn = frontFace.querySelector('.visit-reel-btn');
        if (visitBtn) {
            visitBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(reel.reelUrl, '_blank');
            });
        }
        
        // Add flip button click listener (front to back)
        const flipButton = frontFace.querySelector('.flip-button');
        if (flipButton) {
            flipButton.addEventListener('click', (e) => {
                e.stopPropagation();
                flipCardInner.classList.add('flipped');
            });
        }
        
        // Add flip-back button click listener (back to front)
        const flipBackButton = backFace.querySelector('.flip-back-button');
        if (flipBackButton) {
            flipBackButton.addEventListener('click', (e) => {
                e.stopPropagation();
                flipCardInner.classList.remove('flipped');
            });
        }
        
        return slide;
    }
    
    extractReelId(url) {
        // Handle both /reel/ and /p/ formats
        let match = url.match(/reel\/([A-Za-z0-9_-]+)/);
        if (!match) {
            match = url.match(/\/p\/([A-Za-z0-9_-]+)/);
        }
        return match ? match[1] : null;
    }
    
    loadInstagramEmbedScript() {
        // Check if Instagram embed script is already loaded
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = '//www.instagram.com/embed.js';
            script.onload = () => {
                // Process embeds after script loads with delay
                setTimeout(() => {
                    if (window.instgrm) {
                        window.instgrm.Embeds.process();
                    }
                }, 1000);
            };
            document.body.appendChild(script);
        } else if (window.instgrm) {
            // If script is already loaded, process embeds with delay
            setTimeout(() => {
                window.instgrm.Embeds.process();
            }, 1000);
        }
    }
    
    setupNavigation() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scrollPrev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scrollNext());
        }
    }
    
    setupScrollSync() {
        // Update dots and navigation on scroll
        if (this.wrapper) {
            this.wrapper.addEventListener('scroll', () => {
                this.updateCurrentIndex();
                this.updateNavigation();
            });
        }
    }
    
    updateCurrentIndex() {
        const scrollLeft = this.wrapper.scrollLeft;
        const cardWidth = this.slides[0]?.offsetWidth || 300;
        const gap = 24; // 1.5rem gap
        this.currentIndex = Math.round(scrollLeft / (cardWidth + gap));
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.scrollToIndex(index));
            this.dotsContainer.appendChild(dot);
        });
    }
    
    updateNavigation() {
        // Update dots
        const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
        dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update arrows
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex >= this.slides.length - 1;
        }
    }
    
    scrollToIndex(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        const cardWidth = this.slides[0].offsetWidth;
        const gap = 24; // 1.5rem gap
        const scrollPosition = index * (cardWidth + gap);
        
        this.wrapper.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
    
    scrollNext() {
        const maxIndex = this.slides.length - 1;
        const nextIndex = Math.min(this.currentIndex + 1, maxIndex);
        this.scrollToIndex(nextIndex);
    }
    
    scrollPrev() {
        const prevIndex = Math.max(this.currentIndex - 1, 0);
        this.scrollToIndex(prevIndex);
    }
    
    showEmpty() {
        this.wrapper.innerHTML = `
            <div class="carousel-empty">
                <i class="fab fa-instagram"></i>
                <p>No Instagram reels added yet. Use the admin panel to add your latest reels!</p>
            </div>
        `;
    }
    
    showError() {
        this.wrapper.innerHTML = `
            <div class="carousel-empty">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load Instagram reels. Please try again later.</p>
            </div>
        `;
    }
}


// ============================================
// Skills Section with Flip Cards
// ============================================
class SkillsManager {
    constructor() {
        this.skillsGrid = document.getElementById('skillsGrid');
        this.skillsEmpty = document.getElementById('skillsEmpty');
        this.skills = [];
        this.init();
    }

    async init() {
        await this.loadSkills();
        this.renderSkills();
        this.setupScrollAnimations();
    }

    async loadSkills() {
        try {
            // Fetch skills from backend API
            const response = await fetch('/api/skills');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.skills = await response.json();
            
            // Handle empty array or fallback data structure from API
            if (!Array.isArray(this.skills)) {
                if (this.skills.data) {
                    this.skills = this.skills.data;
                } else {
                    this.skills = [];
                }
            }
        } catch (error) {
            console.error('Error loading skills from API:', error);
            // Fallback to empty array if API fails
            this.skills = [];
        }
    }

    renderSkills() {
        if (!this.skillsGrid) return;

        // Clear loading state
        this.skillsGrid.innerHTML = '';

        // Check if skills exist
        if (!this.skills || this.skills.length === 0) {
            if (this.skillsEmpty) {
                this.skillsEmpty.style.display = 'block';
            }
            return;
        }

        // Hide empty state
        if (this.skillsEmpty) {
            this.skillsEmpty.style.display = 'none';
        }

        // Render each skill card
        this.skills.forEach((skill, index) => {
            const card = this.createSkillCard(skill, index);
            this.skillsGrid.appendChild(card);
        });

        // Setup flip interactions after rendering
        this.setupFlipInteractions();
    }

    createSkillCard(skill, index) {
        const card = document.createElement('div');
        card.className = 'skill-flip-card animate-on-scroll';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Determine if skill has background image for FRONT card
        const hasFrontBackgroundImage = skill.backgroundImage && skill.backgroundImage.trim() !== '';
        
        // Create background image style for front card combining gradient and image
        let frontBackgroundStyle = '';
        if (hasFrontBackgroundImage) {
            // Layer gradient over the custom image
            frontBackgroundStyle = `background-image: linear-gradient(45deg, #000537cc, #010012dd), url('${skill.backgroundImage}');`;
        }
        
        // Determine if skill has background image for BACK card
        const hasBackgroundImage = skill.backgroundImage && skill.backgroundImage.trim() !== '';
        let backgroundImageStyle = '';
        if (hasBackgroundImage) {
            backgroundImageStyle = `background-image: linear-gradient(45deg, #000537ee, #010012ee), url('${skill.backgroundImage}'); background-size: cover; background-position: center;`;
        }
        
        card.innerHTML = `
            <div class="skill-card-inner">
                <!-- Front Face -->
                <div class="skill-card-front" ${frontBackgroundStyle ? `style="${frontBackgroundStyle}"` : ''}>
                    <div class="skill-icon-wrapper">
                        <div class="skill-icon">
                            ${skill.iconImage && skill.iconImage.trim() !== '' 
                                ? `<img src="${skill.iconImage}" alt="${skill.name}" style="width: 100%; height: 100%; object-fit: contain;">`
                                : `<i class="${skill.icon}"></i>`
                            }
                        </div>
                    </div>
                    <div class="skill-category">${skill.category}</div>
                    <h3 class="skill-name">${skill.name}</h3>
                    
                    <!-- Circular Proficiency Indicator -->
                    <div class="proficiency-circle">
                        <svg width="120" height="120">
                            <defs>
                                <linearGradient id="skillGradient${skill.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle class="proficiency-bg" cx="60" cy="60" r="50"></circle>
                            <circle class="proficiency-progress" cx="60" cy="60" r="50" 
                                    style="stroke: url(#skillGradient${skill.id})"
                                    data-proficiency="${skill.proficiency}"></circle>
                        </svg>
                        <div class="proficiency-text">
                            <span class="proficiency-value" data-target="${skill.proficiency}">0</span>%
                        </div>
                    </div>
                    
                    <div class="flip-hint">
                        <span>Hover to see projects</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>

                <!-- Back Face -->
                <div class="skill-card-back" ${hasBackgroundImage ? `style="${backgroundImageStyle}"` : ''}>
                    ${hasBackgroundImage ? '<div class="skill-back-overlay"></div>' : ''}
                    <div class="skill-back-content">
                        <div class="skill-back-header">
                            <h3>${skill.name}</h3>
                        </div>
                        
                        <p class="skill-back-description">${skill.description}</p>
                        
                        <div>
                            <div class="skill-projects-header">
                                <i class="fas fa-star"></i>
                                <span>Featured Work</span>
                            </div>
                            <ul class="skill-projects-list">
                                ${skill.projects.map(project => `
                                    <li>${project}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="flip-back-hint">
                            <i class="fas fa-arrow-left"></i> Mouseleave to flip back
                        </div>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    setupFlipInteractions() {
        // Flip now happens on hover via CSS
        // No JavaScript needed for the flip animation
        // This function kept for potential future enhancements
    }

    setupScrollAnimations() {
        const skillCards = document.querySelectorAll('.skill-flip-card');
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate proficiency circle
                    const progressCircle = entry.target.querySelector('.proficiency-progress');
                    const proficiencyValue = entry.target.querySelector('.proficiency-value');
                    
                    if (progressCircle && proficiencyValue) {
                        this.animateProficiency(progressCircle, proficiencyValue);
                    }
                    
                    skillObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        skillCards.forEach(card => skillObserver.observe(card));
    }

    animateProficiency(circleElement, valueElement) {
        const targetProficiency = parseInt(circleElement.getAttribute('data-proficiency'));
        const circumference = 2 * Math.PI * 50; // radius is 50
        const offset = circumference - (targetProficiency / 100) * circumference;
        
        // Animate circle
        setTimeout(() => {
            circleElement.style.strokeDashoffset = offset;
        }, 100);

        // Animate number
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(progress * targetProficiency);
            valueElement.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                valueElement.textContent = targetProficiency;
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Public method to refresh skills (called from admin panel)
    refresh() {
        this.loadSkills().then(() => {
            this.renderSkills();
            this.setupScrollAnimations();
        });
    }
}

// ============================================
// YouTube Video Section
// ============================================
class YouTubeVideoSection {
    constructor() {
        this.gridContainer = document.getElementById('youtubeGrid');
        this.emptyState = document.getElementById('youtubeEmpty');
        this.videos = [];
        this.init();
    }

    async init() {
        await this.loadVideos();
        this.renderVideos();
    }

    async loadVideos() {
        try {
            // Fetch videos from backend API
            const response = await fetch('/api/youtube');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.videos = await response.json();
            
            // Handle empty array or fallback data structure from API
            if (!Array.isArray(this.videos)) {
                if (this.videos.data) {
                    this.videos = this.videos.data;
                } else {
                    this.videos = [];
                }
            }
        } catch (error) {
            console.error('Error loading YouTube videos from API:', error);
            // Fallback to empty array if API fails
            this.videos = [];
        }
    }

    renderVideos() {
        if (!this.gridContainer) return;

        // Clear loading state
        this.gridContainer.innerHTML = '';

        // Check if videos exist
        if (!this.videos || this.videos.length === 0) {
            if (this.emptyState) {
                this.emptyState.style.display = 'block';
            }
            return;
        }

        // Hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }

        // Render each video card
        this.videos.forEach((video, index) => {
            const card = this.createVideoCard(video, index);
            this.gridContainer.appendChild(card);
        });
    }

    createVideoCard(video, index) {
        const card = document.createElement('div');
        card.className = 'youtube-video-card animate-on-scroll';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Generate thumbnail URL from video ID
        const thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
        
        card.innerHTML = `
            <div class="youtube-thumbnail-wrapper">
                <img src="${thumbnailUrl}" alt="${video.title}" class="youtube-thumbnail" 
                     onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
                <div class="youtube-play-button">
                    <i class="fab fa-youtube"></i>
                </div>
            </div>
            <div class="youtube-video-info">
                ${video.category ? `<span class="youtube-category">${video.category}</span>` : ''}
                <h3 class="youtube-video-title">${video.title}</h3>
                ${video.description ? `<p class="youtube-video-description">${video.description}</p>` : ''}
            </div>
        `;
        
        // Make card clickable to open YouTube video
        card.addEventListener('click', () => {
            window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
        });
        
        return card;
    }

    // Public method to refresh videos (called from admin panel)
    refresh() {
        this.loadVideos().then(() => {
            this.renderVideos();
        });
    }
}

// ============================================
// Navigation
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Smooth scroll and active link
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            if (navMenu) {
                navMenu.classList.remove('active');
                const icon = navToggle?.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active link on scroll
    window.addEventListener('scroll', function () {
        let current = '';
        const sections = document.querySelectorAll('.section, .hero-section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
});

// ============================================
// Initialize Carousels
// ============================================
let carousels = {};
let skillsManager;
let instagramReelsCarousel;
let youtubeVideoSection;

function initializeCarousels() {
    // Initialize Instagram Reels Carousel
    instagramReelsCarousel = new InstagramReelsCarousel('instagramReelsCarousel');
    
    // Initialize YouTube Video Section
    youtubeVideoSection = new YouTubeVideoSection();
    
    // Initialize other carousels
    carousels.blogs = new CarouselController('blogsCarousel', 'blogs');
    carousels.commercial = new CarouselController('commercialCarousel', 'commercial');
    
    // Initialize skills
    skillsManager = new SkillsManager();
}

// ============================================
// Initialize on page load
// ============================================
window.addEventListener('load', function () {
    // Start loading screen
    const loader = new LoadingScreen();
    loader.start();
    
    // Initialize SkillsManager immediately (don't wait for loading screen)
    skillsManager = new SkillsManager();
});

// ============================================
//Contact Form (keeping existing functionality)
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        console.log('Form submitted:', formData);
        alert('Thank you for your message! I\'ll get back to you soon.');
        contactForm.reset();
    });
}

// ============================================
// Scroll Animations (keeping existing functionality)
// ============================================
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');

            if (entry.target.querySelector('.stat-number')) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    animateCounter(stat);
                });
            }
        }
    });
}, observerOptions);

const animateElements = document.querySelectorAll('.animate-on-scroll');
animateElements.forEach(element => {
    observer.observe(element);
});

function animateCounter(element) {
    if (element.classList.contains('counted')) return;
    element.classList.add('counted');

    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// About Section Dynamic Loader
// ============================================
async function loadAboutSection() {
    try {
        const response = await fetch('/api/about');
        if (!response.ok) {
            console.log('About section not found in API, using default content');
            return;
        }
        
        const aboutData = await response.json();
        
        // Update profile image
        if (aboutData.profileImage) {
            const aboutImage = document.querySelector('.about-image');
            if (aboutImage) {
                aboutImage.src = aboutData.profileImage;
            }
        }
        
        // Update heading
        if (aboutData.heading) {
            const aboutHeading = document.querySelector('.about-text h3');
            if (aboutHeading) {
                aboutHeading.textContent = aboutData.heading;
            }
        }
        
        // Update content (paragraphs)
        if (aboutData.content) {
            const aboutTextDiv = document.querySelector('.about-text');
            if (aboutTextDiv) {
                // Split content by newlines and create paragraphs
                const paragraphs = aboutData.content.split('\n\n').filter(p => p.trim());
                
                // Find existing h3 to keep it
                const heading = aboutTextDiv.querySelector('h3');
                
                // Clear existing paragraphs but keep heading
                const existingPs = aboutTextDiv.querySelectorAll('p');
                existingPs.forEach(p => p.remove());
                
                // Insert new paragraphs after heading
                paragraphs.forEach(text => {
                    const p = document.createElement('p');
                    p.textContent = text.trim();
                    aboutTextDiv.insertBefore(p, aboutTextDiv.querySelector('.stats-grid'));
                });
            }
        }
        
        // Update statistics
        if (aboutData.statistics) {
            const statNumbers = document.querySelectorAll('.stat-number');
            if (statNumbers.length >= 3) {
                if (aboutData.statistics.projects) {
                    statNumbers[0].setAttribute('data-target', aboutData.statistics.projects);
                    statNumbers[0].textContent = '0';
                }
                if (aboutData.statistics.clients) {
                    statNumbers[1].setAttribute('data-target', aboutData.statistics.clients);
                    statNumbers[1].textContent = '0';
                }
                if (aboutData.statistics.experience) {
                    statNumbers[2].setAttribute('data-target', aboutData.statistics.experience);
                    statNumbers[2].textContent = '0';
                }
            }
        }
        
        console.log('✅ About section loaded from API');
    } catch (error) {
        console.error('Error loading about section:', error);
        // Keep default content if API fails
    }
}

// Load About section on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAboutSection();
});

// ============================================
// Console Easter Egg
// ============================================
console.log('%c🌟 Influencer Portfolio', 'font-size: 24px; font-weight: bold; color: #8b5cf6;');
console.log('%cCreating content that inspires millions!', 'font-size: 14px; color: #06b6d4;');
