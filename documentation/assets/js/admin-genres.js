// ============================================
// Admin Genre Management
// ============================================

(function() {
    'use strict';

    let genres = [];
    let currentGenreId = null;
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        initializeGenres();
        setupGenreHandlers();
        setupAdminGenreEvents();
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
            renderGenresList();
            
            console.log(`✅ Loaded ${genres.length} genres`);

        } catch (error) {
            console.error('Error loading genres:', error);
            // Use default genres if API fails
            genres = [
                { name: 'Motion Graphics', _id: 'default1', category: 'both', isDefault: true },
                { name: 'Commercial', _id: 'default2', category: 'both', isDefault: true },
                { name: 'Others', _id: 'default3', category: 'both', isDefault: true }
            ];
            populateGenreDropdowns();
            renderGenresList();
        }
    }

    // Render genres in admin list
    function renderGenresList() {
        const listContainer = document.getElementById('genresList');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (!genres || genres.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No genres found.</p>';
            return;
        }

        genres.forEach(genre => {
            const item = document.createElement('div');
            item.className = 'skill-item genre-item'; // Reuse skill-item for styling
            
            const categoryLabel = genre.category === 'both' ? 'All Categories' : 
                                (genre.category === 'youtube' ? 'YouTube Only' : 'Client Work Only');
            
            const deleteBtn = genre.isDefault ? 
                `<button class="btn-delete disabled" disabled title="Cannot delete default genre"><i class="fas fa-lock"></i></button>` :
                `<button class="btn-delete" onclick="AdminGenres.deleteGenre('${genre._id}')"><i class="fas fa-trash"></i> Delete</button>`;

            item.innerHTML = `
                <div class="skill-item-header">
                    <div class="skill-item-icon">
                        <i class="fas fa-tag"></i>
                    </div>
                    <div class="skill-item-info">
                        <h3>${genre.name}</h3>
                        <div class="skill-item-category">${categoryLabel}</div>
                    </div>
                </div>
                <div class="skill-item-actions">
                     ${deleteBtn}
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    // Populate genre dropdowns
    function populateGenreDropdowns() {
        const clientWorkDropdown = document.getElementById('clientWorkGenre');
        const youtubeDropdown = document.getElementById('youtubeGenre');

        if (clientWorkDropdown) {
            populateDropdown(clientWorkDropdown, 'clientWork');
       }

        if (youtubeDropdown) {
            populateDropdown(youtubeDropdown, 'youtube');
        }
    }

    function populateDropdown(dropdown, context) {
        const currentValue = dropdown.value;
        
        // Clear existing options except the first placeholder
        dropdown.innerHTML = '<option value="">Select Genre</option>';
        
        // Filter genres based on context
        const relevantGenres = genres.filter(g => 
            g.category === 'both' || g.category === context
        );

        // Sort: Default genres first, then alphabetical
        relevantGenres.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return a.name.localeCompare(b.name);
        });
        
        // Add genre options
        relevantGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            dropdown.appendChild(option);
        });

        // Restore selected value if it exists
        if (currentValue && relevantGenres.find(g => g.name === currentValue)) {
            dropdown.value = currentValue;
        }
    }

    // Setup genre change handlers (Client Work & YouTube)
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

    // Admin UI Event Listeners
    function setupAdminGenreEvents() {
        const addBtn = document.getElementById('addGenreBtn');
        const refreshBtn = document.getElementById('refreshGenresBtn');
        const closeBtn = document.getElementById('closeGenreModal');
        const cancelBtn = document.getElementById('cancelGenreBtn');
        const form = document.getElementById('genreForm');

        if (addBtn) addBtn.addEventListener('click', () => openGenreModal());
        if (refreshBtn) refreshBtn.addEventListener('click', () => loadGenres());
        if (closeBtn) closeBtn.addEventListener('click', () => closeGenreModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => closeGenreModal());
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await saveGenre();
            });
        }
    }

    function openGenreModal() {
        const modal = document.getElementById('genreModal');
        const form = document.getElementById('genreForm');
        
        if (modal) {
            form.reset();
            currentGenreId = null;
            document.getElementById('genreModalTitle').textContent = 'Add New Genre';
            modal.classList.add('active');
        }
    }

    function closeGenreModal() {
        const modal = document.getElementById('genreModal');
        if (modal) {
            modal.classList.remove('active');
            currentGenreId = null;
        }
    }

    // Save genre (Admin UI)
    async function saveGenre() {
        const nameInput = document.getElementById('genreName');
        const categoryInput = document.getElementById('genreCategory');
        
        const name = nameInput.value.trim();
        const category = categoryInput.value;

        if (!name) {
            alert('Please enter a genre name');
            return;
        }

        try {
            await saveCustomGenre(name, category);
            closeGenreModal();
            if (window.adminPanel && window.adminPanel.showNotification) {
                window.adminPanel.showNotification('Genre saved successfully!');
            }
        } catch (error) {
            alert(error.message);
        }
    }

    // Delete genre
    async function deleteGenre(id) {
        if (!confirm('Are you sure you want to delete this genre?')) return;

        try {
            const response = await fetch(`/api/genres/${id}`, { method: 'DELETE' });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete genre');
            }

            if (window.adminPanel && window.adminPanel.showNotification) {
                window.adminPanel.showNotification('Genre deleted successfully!');
            }
            loadGenres();

        } catch (error) {
            console.error('Error deleting genre:', error);
            alert('Failed to delete genre: ' + error.message);
        }
    }

    // Save custom genre (Shared logic)
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

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save genre');
            }

            console.log(`✅ Genre created: ${genreName}`);
            
            // Reload genres to update dropdowns
            await loadGenres();
            
            return result.genre;

        } catch (error) {
            console.error('Error saving genre:', error);
            throw error;
        }
    }

    // Get selected genre (handles custom genres) - Helper for other modules
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
        deleteGenre,
        refresh: loadGenres
    };

})();
