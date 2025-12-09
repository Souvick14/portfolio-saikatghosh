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
// ============================================
class InstagramReelsCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.wrapper = this.container.querySelector('.instagram-carousel-wrapper');
        this.dotsContainer = document.getElementById('instagramReelsDots');
        this.currentIndex = 0;
        this.slides = [];
        this.autoPlayInterval = null;
        this.isPlaying = false;
        
        // Navigation buttons
        const arrows = this.container.querySelectorAll('.carousel-arrow');
        this.prevBtn = Array.from(arrows).find(btn => btn.classList.contains('prev-arrow'));
        this.nextBtn = Array.from(arrows).find(btn => btn.classList.contains('next-arrow'));
        
        this.init();
    }
    
    async init() {
        await this.loadInstagramReels();
        this.setupNavigation();
        this.startAutoPlay();
        this.setupSwipeGestures();
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
            
            this.wrapper.innerHTML = '';
            
            // Load each reel using Instagram oEmbed API
            for (const reel of reels) {
                const slide = await this.createReelSlide(reel);
                this.wrapper.appendChild(slide);
            }
            
            // Load Instagram embed script
            this.loadInstagramEmbedScript();
            
            this.slides = this.wrapper.querySelectorAll('.instagram-carousel-slide');
            this.createDots();
            this.updateNavigation();
            
        } catch (error) {
            console.error('Error loading Instagram reels from API:', error);
            this.showError();
        }
    }
    
    async createReelSlide(reel) {
        const slide = document.createElement('div');
        slide.className = 'instagram-carousel-slide';
        
        // Extract Instagram reel ID from URL
        const reelId = this.extractReelId(reel.reelUrl);
        
        slide.innerHTML = `
            <div class="instagram-embed-wrapper">
                <blockquote class="instagram-media" 
                            data-instgrm-permalink="${reel.reelUrl}" 
                            data-instgrm-version="14"
                            style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
                    <div style="padding:16px;">
                        <p style="margin:8px 0 0 0; padding:0 4px; text-align:center;">
                            <a href="${reel.reelUrl}" 
                               style="color:#000; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none; word-wrap:break-word;" 
                               target="_blank">Loading Instagram Reel...</a>
                        </p>
                    </div>
                </blockquote>
            </div>
        `;
        
        return slide;
    }
    
    extractReelId(url) {
        const match = url.match(/reel\/([A-Za-z0-9_-]+)/);
        return match ? match[1] : null;
    }
    
    loadInstagramEmbedScript() {
        // Check if Instagram embed script is already loaded
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = '//www.instagram.com/embed.js';
            document.body.appendChild(script);
        } else if (window.instgrm) {
            // If script is already loaded, process embeds
            window.instgrm.Embeds.process();
        }
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
        
        // Update arrows (disabled for looping carousel)
        if (this.prevBtn) {
            this.prevBtn.disabled = false;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = false;
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
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prev() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.isPlaying = true;
        
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
    }
    
    setupSwipeGestures() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
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
        });
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
        
        card.innerHTML = `
            <div class="skill-card-inner">
                <!-- Front Face -->
                <div class="skill-card-front" ${frontBackgroundStyle ? `style="${frontBackgroundStyle}"` : ''}>
                    <div class="skill-icon-wrapper">
                        <div class="skill-icon">
                            <i class="${skill.icon}"></i>
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
                        <span>Click to see projects</span>
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
                            <i class="fas fa-arrow-left"></i> Click to flip back
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

function initializeCarousels() {
    // Initialize Instagram Reels Carousel
    instagramReelsCarousel = new InstagramReelsCarousel('instagramReelsCarousel');
    
    // Initialize other carousels
    carousels.reels = new CarouselController('reelsCarousel', 'reels');
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
// Console Easter Egg
// ============================================
console.log('%c🌟 Influencer Portfolio', 'font-size: 24px; font-weight: bold; color: #8b5cf6;');
console.log('%cCreating content that inspires millions!', 'font-size: 14px; color: #06b6d4;');
