// ============================================
// Client's Work - Frontend Display
// ============================================

(function() {
    'use strict';

    let allClientWorks = [];
    let currentlyDisplayed = 0;
    const ITEMS_PER_PAGE = 8; // 2 rows × 4 columns
    let genres = [];
    let currentGenreFilter = 'all';

    document.addEventListener('DOMContentLoaded', function() {
        loadGenres();
        loadClientsWork();
        setupLoadMoreButton();
    });

    // Load genres from API
    async function loadGenres() {
        try {
            const response = await fetch('/api/genres');
            if (response.ok) {
                genres = await response.json();
                renderGenreButtons();
            }
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    // Render genre filter buttons
    function renderGenreButtons() {
        const container = document.getElementById('clientWorkGenreFilters');
        if (!container || genres.length === 0) return;

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
        currentlyDisplayed = 0;
        
        const grid = document.getElementById('clientsWorkGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        displayNextPage();
    }

    async function loadClientsWork() {
        const grid = document.getElementById('clientsWorkGrid');
        
        if (!grid) return;

        try {
            const response = await fetch('/api/client-work');
            
            if (!response.ok) {
                throw new Error('Failed to load client work');
            }

            allClientWorks = await response.json();
            
            // Clear loading state
            grid.innerHTML = '';

            if (!allClientWorks || allClientWorks.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                        <i class="fas fa-briefcase" style="font-size: 4rem; color: var(--primary-purple); opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary); font-size: 1.125rem;">No client work available yet</p>
                    </div>
                `;
                return;
            }

            // Display first page (8 items)
            displayNextPage();
            
            console.log(`✅ Loaded ${allClientWorks.length} client work items`);

        } catch (error) {
            console.error('Error loading client work:', error);
            grid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--error); opacity: 0.5; margin-bottom: 1rem;"></i>
                    <p style="color: var(--error);">Failed to load client work</p>
                </div>
            `;
        }
    }

    function displayNextPage() {
        const grid = document.getElementById('clientsWorkGrid');
        const loadMoreContainer = document.getElementById('clientsWorkLoadMoreContainer');
        const loadMoreBtn = document.getElementById('clientsWorkLoadMore');
        
        // Apply genre filter and sort
        let filteredWorks = [...allClientWorks];
        
        if (currentGenreFilter !== 'all') {
            filteredWorks = filteredWorks.filter(work => {
                if (!work.genre) return false;
                return work.genre.trim().toLowerCase() === currentGenreFilter.trim().toLowerCase();
            });
        }
        
        // Sort by date (newest first)
        filteredWorks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Calculate how many items to show
        const endIndex = Math.min(currentlyDisplayed + ITEMS_PER_PAGE, filteredWorks.length);
        const itemsToShow = filteredWorks.slice(currentlyDisplayed, endIndex);
        
        // Render cards
        itemsToShow.forEach(work => {
            const card = createClientWorkCard(work);
            grid.appendChild(card);
        });
        
        currentlyDisplayed = endIndex;
        
        // Update button state
        if (currentlyDisplayed < filteredWorks.length) {
            // Show Load More button
            loadMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Load More Projects';
            loadMoreBtn.onclick = displayNextPage;
            loadMoreContainer.style.display = 'block';
        } else if (currentlyDisplayed > ITEMS_PER_PAGE) {
            // Show Less button when all items shown and more than initial amount
            loadMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
            loadMoreBtn.onclick = showLess;
            loadMoreContainer.style.display = 'block';
        } else {
            // Hide button if showing exactly initial amount or less
            loadMoreContainer.style.display = 'none';
        }
    }

    function showLess() {
        const grid = document.getElementById('clientsWorkGrid');
        const loadMoreBtn = document.getElementById('clientsWorkLoadMore');
        
        // Remove excess cards
        const cards = grid.querySelectorAll('.client-work-card');
        for (let i = cards.length - 1; i >= ITEMS_PER_PAGE; i--) {
            cards[i].remove();
        }
        
        currentlyDisplayed = ITEMS_PER_PAGE;
        
        // Update button to Load More
        loadMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Load More Projects';
        loadMoreBtn.onclick = displayNextPage;
        
        // Scroll to section top
        const section = document.getElementById('clients-work');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function createClientWorkCard(work) {
        const card = document.createElement('div');
        card.className = 'client-work-card';
        
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

    function setupLoadMoreButton() {
        // Button click handler is set dynamically by displayNextPage/showLess
        // This function is kept for potential future setup needs
    }

})();
