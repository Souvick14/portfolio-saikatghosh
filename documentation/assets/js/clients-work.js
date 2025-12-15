// ============================================
// Client's Work - Frontend Display
// ============================================

(function() {
    'use strict';

    let allClientWorks = [];
    let currentGenreFilter = 'all';

    document.addEventListener('DOMContentLoaded', function() {
        loadGenres();
        loadClientsWork();
        setupScrollButtons();
    });

    // Load genres from API
    async function loadGenres() {
        try {
            const response = await fetch('/api/genres');
            if (response.ok) {
                const genres = await response.json();
                renderGenreButtons(genres);
            }
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    // Render genre filter buttons
    function renderGenreButtons(genres) {
        const container = document.getElementById('clientWorkGenreFilters');
        if (!container || !genres || genres.length === 0) return;

        container.innerHTML = `
            <button class="genre-btn active" data-genre="all">All</button>
            ${genres.map(genre => `
                <button class="genre-btn" data-genre="${genre.name}">${genre.name}</button>
            `).join('')}
        `;

        // Add click handlers
        container.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                filterByGenre(this.dataset.genre);
                
                // Update active state
                container.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Filter by genre
    function filterByGenre(genre) {
        currentGenreFilter = genre;
        loadClientsWork(); // Re-render with filter
    }

    async function loadClientsWork() {
        const grid = document.getElementById('clientsWorkGrid');
        
        if (!grid) return;

        try {
            // Only fetch if not already loaded (simple cache)
            if (allClientWorks.length === 0) {
                const response = await fetch('/api/client-work');
                
                if (!response.ok) {
                    throw new Error('Failed to load client work');
                }

                allClientWorks = await response.json();
            }
            
            // Clear loading state
            grid.innerHTML = '';
            
            // Apply filtering
            let filteredWorks = [...allClientWorks];
            if (currentGenreFilter !== 'all') {
                filteredWorks = filteredWorks.filter(work => {
                    if (!work.genre) return false;
                    return work.genre.trim().toLowerCase() === currentGenreFilter.trim().toLowerCase();
                });
            }

            // Sort by date (newest first)
            filteredWorks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            if (!filteredWorks || filteredWorks.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="width: 100%; flex: 1; text-align: center; padding: 4rem 2rem;">
                        <i class="fas fa-briefcase" style="font-size: 4rem; color: var(--primary-purple); opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary); font-size: 1.125rem;">No client work available for this category</p>
                    </div>
                `;
                updateScrollButtons(); // Update buttons (likely hide both)
                return;
            }

            // Render all filtered cards
            filteredWorks.forEach(work => {
                const card = createClientWorkCard(work);
                grid.appendChild(card);
            });
            
            console.log(`✅ Loaded ${filteredWorks.length} client work items`);
            
            // Reset scroll position
            grid.scrollLeft = 0;
            updateScrollButtons();

        } catch (error) {
            console.error('Error loading client work:', error);
            grid.innerHTML = `
                <div class="error-state" style="width: 100%; flex: 1; text-align: center; padding: 4rem 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--error); opacity: 0.5; margin-bottom: 1rem;"></i>
                    <p style="color: var(--error);">Failed to load client work</p>
                </div>
            `;
            updateScrollButtons();
        }
    }

    function createClientWorkCard(work) {
        const card = document.createElement('div');
        card.className = 'client-work-card';
        // Add specific width class or let CSS handle it via flex-basis in .horizontal-scroll-grid > *
        
        // Extract YouTube video ID
        let videoId = extractYouTubeId(work.youtubeUrl);
        
        // Create technology logos HTML
        const logosHTML = work.technologyLogos && work.technologyLogos.length > 0 
            ? `
                <div class="tech-logos">
                    ${work.technologyLogos.map(logo => `
                        <img src="${logo}" alt="Technology logo" class="tech-logo">
                    `).join('')}
                </div>
            `
            : '';
        
        card.innerHTML = `
            <div class="client-work-video">
                ${videoId ? `
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                ` : `
                    <div class="video-placeholder">
                        <i class="fab fa-youtube"></i>
                        <p>Video unavailable</p>
                    </div>
                `}
            </div>
            <div class="client-work-info">
                <div class="client-work-header">
                    <span class="client-brand">${work.brand}</span>
                    ${work.engagement ? `<span class="engagement-badge">${work.engagement}</span>` : ''}
                </div>
                <h3 class="client-work-title">${work.title}</h3>
                <p class="client-work-description">${work.description}</p>
                ${logosHTML}
                ${work.revenue ? `<p class="revenue-info"><i class="fas fa-dollar-sign"></i> ${work.revenue}</p>` : ''}
            </div>
        `;
        
        return card;
    }

    function extractYouTubeId(url) {
        if (!url) return null;
        
        // youtube.com/shorts/VIDEO_ID (YouTube Shorts)
        let match = url.match(/\/shorts\/([A-Za-z0-9_-]+)/);
        if (match) return match[1];
        
        // youtu.be/VIDEO_ID
        match = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
        if (match) return match[1];
        
        // youtube.com/watch?v=VIDEO_ID
        match = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
        if (match) return match[1];
        
        // youtube.com/embed/VIDEO_ID
        match = url.match(/embed\/([A-Za-z0-9_-]+)/);
        if (match) return match[1];
        
        return null;
    }

    // Scroll Logic
    function setupScrollButtons() {
        const grid = document.getElementById('clientsWorkGrid');
        const prevBtn = document.getElementById('clientWorkPrev');
        const nextBtn = document.getElementById('clientWorkNext');
        
        if (!grid || !prevBtn || !nextBtn) return;
        
        // Scroll amount: Width of one item + gap, or partial container width
        const getScrollAmount = () => {
             // Approximately one card width + gap. 
             // Or safer: container width * 0.75 to scroll 3 items at a time
             return grid.clientWidth * 0.75;
        };

        prevBtn.addEventListener('click', () => {
            grid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            grid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        // Update button visibility on scroll
        grid.addEventListener('scroll', updateScrollButtons);
        
        // Update on resize
        window.addEventListener('resize', updateScrollButtons);
    }

    function updateScrollButtons() {
        const grid = document.getElementById('clientsWorkGrid');
        const prevBtn = document.getElementById('clientWorkPrev');
        const nextBtn = document.getElementById('clientWorkNext');
        
        if (!grid || !prevBtn || !nextBtn) return;

        const tolerance = 5; // Pixels tolerance for calculation
        const maxScrollLeft = grid.scrollWidth - grid.clientWidth;

        // Show prev button if scrolled right
        if (grid.scrollLeft > tolerance) {
            prevBtn.classList.add('visible');
        } else {
            prevBtn.classList.remove('visible');
        }

        // Show next button if can scroll more right
        if (maxScrollLeft - grid.scrollLeft > tolerance) {
            nextBtn.classList.add('visible');
        } else {
            nextBtn.classList.remove('visible');
        }
    }

})();
