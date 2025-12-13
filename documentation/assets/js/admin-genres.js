// ============================================
// Admin Genre Management
// ============================================

(function() {
    'use strict';

    let genres = [];
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        initializeGenres();
        setupGenreHandlers();
    });

    // Initialize default genres
    async function initializeGenres() {
        try {
            // Call initialization endpoint to ensure default genres exist
            await fetch('/api/genres/initialize-defaults', { method: 'POST' });
            loadGenres();
        } catch (error) {
            console.error('Error initializing genres:', error);
            loadGenres(); // Try loading anyway
        }
    }

    // Load genres from API
    async function loadGenres() {
        try {
            const response = await fetch('/api/genres');
            if (!response.ok) throw new Error('Failed to load genres');

            genres = await response.json();
            populateGenreDropdowns();
            
            console.log(`✅ Loaded ${genres.length} genres`);

        } catch (error) {
            console.error('Error loading genres:', error);
            // Use default genres if API fails
            genres = [
                { name: 'Motion Graphics', _id: 'default1' },
                { name: 'Commercial', _id: 'default2' },
                { name: 'Others', _id: 'default3' }
            ];
            populateGenreDropdowns();
        }
    }

    // Populate genre dropdowns
    function populateGenreDropdowns() {
        const clientWorkDropdown = document.getElementById('clientWorkGenre');
        const youtubeDropdown = document.getElementById('youtubeGenre');

        if (clientWorkDropdown) {
            populateDropdown(clientWorkDropdown);
       }

        if (youtubeDropdown) {
            populateDropdown(youtubeDropdown);
        }
    }

    function populateDropdown(dropdown) {
        const currentValue = dropdown.value;
        
        // Clear existing options except the first placeholder
        dropdown.innerHTML = '<option value="">Select Genre</option>';
        
        // Add genre options
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            dropdown.appendChild(option);
        });

        // Restore selected value if it exists
        if (currentValue && genres.find(g => g.name === currentValue)) {
            dropdown.value = currentValue;
        }
    }

    // Setup genre change handlers
    function setupGenreHandlers() {
        // Client Work genre handler
        const clientWorkGenre = document.getElementById('clientWorkGenre');
        const clientWorkCustomGroup = document.getElementById('clientWorkCustomGenreGroup');
        const clientWorkCustomInput = document.getElementById('clientWorkCustomGenre');

        if (clientWorkGenre && clientWorkCustomGroup) {
            clientWorkGenre.addEventListener('change', function() {
                if (this.value === 'Others') {
                    clientWorkCustomGroup.style.display = 'block';
                    if (clientWorkCustomInput) {
                        clientWorkCustomInput.required = true;
                    }
                } else {
                    clientWorkCustomGroup.style.display = 'none';
                    if (clientWorkCustomInput) {
                        clientWorkCustomInput.required = false;
                        clientWorkCustomInput.value = '';
                    }
                }
            });
        }

        // YouTube genre handler
        const youtubeGenre = document.getElementById('youtubeGenre');
        const youtubeCustomGroup = document.getElementById('youtubeCustomGenreGroup');
        const youtubeCustomInput = document.getElementById('youtubeCustomGenre');

        if (youtubeGenre && youtubeCustomGroup) {
            youtubeGenre.addEventListener('change', function() {
                if (this.value === 'Others') {
                    youtubeCustomGroup.style.display = 'block';
                    if (youtubeCustomInput) {
                        youtubeCustomInput.required = true;
                    }
                } else {
                    youtubeCustomGroup.style.display = 'none';
                    if (youtubeCustomInput) {
                        youtubeCustomInput.required = false;
                        youtubeCustomInput.value = '';
                    }
                }
            });
        }
    }

    // Save custom genre
    async function saveCustomGenre(genreName, category = 'both') {
        try {
            const response = await fetch('/api/genres', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: genreName,
                    category: category
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save genre');
            }

            const result = await response.json();
            console.log(`✅ Custom genre created: ${genreName}`);
            
            // Reload genres to update dropdowns
            await loadGenres();
            
            return result.genre;

        } catch (error) {
            console.error('Error saving custom genre:', error);
            
            // If genre already exists, just reload
            if (error.message.includes('already exists')) {
                await loadGenres();
                return null;
            }
            
            throw error;
        }
    }

    // Get selected genre (handles custom genres)
    async function getSelectedGenre(dropdownId, customInputId) {
        const dropdown = document.getElementById(dropdownId);
        const customInput = document.getElementById(customInputId);

        if (!dropdown) return 'Others';

        const selectedGenre = dropdown.value;

        if (selectedGenre === 'Others' && customInput && customInput.value.trim()) {
            // Create custom genre
            const customGenreName = customInput.value.trim();
            
            try {
                await saveCustomGenre(customGenreName);
                return customGenreName;
            } catch (error) {
                console.error('Failed to save custom genre:', error);
                return 'Others';
            }
        }

        return selectedGenre || 'Others';
    }

    // Expose functions globally for use in other admin scripts
    window.AdminGenres = {
        loadGenres,
        getSelectedGenre,
        saveCustomGenre,
        refresh: loadGenres
    };

})();
