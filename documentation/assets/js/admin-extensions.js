// ============================================
// Admin Panel - Additional Sections JavaScript
// Instagram Reels, Commercial, Contact, About
// ============================================

// Add these methods to the AdminPanel class
// This file extends admin-script.js with additional functionality

// Note: This should be loaded AFTER admin-script.js

// Extend the AdminPanel class with additional methods
if (typeof AdminPanel !== 'undefined') {
    
    // ==========================
    // Instagram Reels Management
    // ==========================
    
    AdminPanel.prototype.loadInstagramReels = async function() {
        const reelsList = document.getElementById('instagramReelsList');
        
        if (!reelsList) return;
        
        reelsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading Instagram reels...</p>';

        try {
            const response = await fetch('/api/reels');
            const reels = await response.json();
            
            reelsList.innerHTML = '';

            if (!reels || reels.length === 0) {
                reelsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No Instagram reels added yet.</p>';
                return;
            }

            reels.forEach(reel => {
                const reelElement = this.createInstagramReelElement(reel);
                reelsList.appendChild(reelElement);
            });
        } catch (error) {
            console.error('Error loading Instagram reels:', error);
            reelsList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 3rem;">Failed to load Instagram reels.</p>';
        }
    };

    AdminPanel.prototype.createInstagramReelElement = function(reel) {
        const div = document.createElement('div');
        div.className = 'reel-item';
        div.innerHTML = `
            <div class="reel-info">
                <i class="fab fa-instagram"></i>
                <div>
                    <h4>${reel.title || reel.reelId || 'Instagram Reel'}</h4>
                    <small>${reel.reelUrl}</small>
                </div>
            </div>
            <div class="reel-actions">
                <button class="btn-edit" data-reel-id="${reel._id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" data-reel-id="${reel._id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners
        const editBtn = div.querySelector('.btn-edit');
        const deleteBtn = div.querySelector('.btn-delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editInstagramReel(reel._id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteInstagramReel(reel._id));
        }
        
        return div;
    };

    AdminPanel.prototype.convertGoogleDriveUrl = function(url) {
        // Convert Google Drive sharing link to direct download link
        // From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        // To: https://drive.google.com/uc?export=download&id=FILE_ID
        
        if (!url) return url;
        
        // Check if it's a Google Drive link
        if (url.includes('drive.google.com')) {
            // Extract file ID from various Google Drive URL formats
            let fileId = null;
            
            // Format 1: https://drive.google.com/file/d/FILE_ID/view or /preview
            const match1 = url.match(/\/file\/d\/([^\/\?]+)/);
            if (match1) {
                fileId = match1[1];
            }
            
            // Format 2: https://drive.google.com/open?id=FILE_ID
            const match2 = url.match(/[?&]id=([^&]+)/);
            if (match2) {
                fileId = match2[1];
            }
            
            if (fileId) {
                // Return direct download URL that works with video tag
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
        }
        
        return url;
    };

    AdminPanel.prototype.saveInstagramReel = async function() {
        let reelUrl = document.getElementById('instagramReelUrl')?.value.trim();
        const reelTitle = document.getElementById('instagramReelTitle')?.value.trim();
        const reelTechInput = document.getElementById('instagramReelTechnologies')?.value.trim();
        const videoFileInput = document.getElementById('reelVideoFile');

        if (!reelUrl) {
            this.showNotification('Please enter a reel URL or video link', 'error');
            return;
        }

        // Automatically convert Google Drive links
        const originalUrl = reelUrl;
        reelUrl = this.convertGoogleDriveUrl(reelUrl);
        
        if (originalUrl !== reelUrl) {
            console.log('🔄 Converted Google Drive URL:', originalUrl, '→', reelUrl);
        }

        // Parse technologies from comma-separated string
        const technologies = reelTechInput 
            ? reelTechInput.split(',').map(t => t.trim()).filter(t => t)
            : [];

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('reelUrl', reelUrl);
            formData.append('title', reelTitle);
            formData.append('technologies', JSON.stringify(technologies));

            // Add video file if selected
            if (videoFileInput && videoFileInput.files && videoFileInput.files[0]) {
                formData.append('videoFile', videoFileInput.files[0]);
            }

            const url = this.currentReelId ? `/api/reels/${this.currentReelId}` : '/api/reels';
            const method = this.currentReelId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formData
                // Don't set Content-Type header - browser will set it with boundary
            });

            if (!response.ok) throw new Error('Failed to save Instagram reel');

            this.showNotification(this.currentReelId ? 'Reel updated!' : 'Reel added!');
            this.closeInstagramReelModal();
            this.loadInstagramReels();
        } catch (error) {
            console.error('Error saving Instagram reel:', error);
            this.showNotification('Failed to save reel', 'error');
        }
    };

    AdminPanel.prototype.deleteInstagramReel = async function(reelId) {
        if (confirm('Delete this Instagram reel?')) {
            try {
                const response = await fetch(`/api/reels/${reelId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                this.loadInstagramReels();
                this.showNotification('Reel deleted!');
            } catch (error) {
                console.error('Error deleting reel:', error);
                this.showNotification('Failed to delete reel', 'error');
            }
        }
    };

    // Event listeners for Instagram Reels
    AdminPanel.prototype.setupInstagramReelsEvents = function() {
        const addReelBtn = document.getElementById('addInstagramReelBtn');
        if (addReelBtn) {
            addReelBtn.addEventListener('click', () => this.openInstagramReelModal());
        }

        const closeReelModal = document.getElementById('closeInstagramReelModal');
        if (closeReelModal) {
            closeReelModal.addEventListener('click', () => this.closeInstagramReelModal());
        }

        const cancelReelBtn = document.getElementById('cancelInstagramReelBtn');
        if (cancelReelBtn) {
            cancelReelBtn.addEventListener('click', () => this.closeInstagramReelModal());
        }

        const reelForm = document.getElementById('instagramReelForm');
        if (reelForm) {
            reelForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveInstagramReel();
            });
        }

        const refreshReelsBtn = document.getElementById('refreshInstagramReelsBtn');
        if (refreshReelsBtn) {
            refreshReelsBtn.addEventListener('click', () => this.loadInstagramReels());
        }

        const previewReelBtn = document.getElementById('previewInstagramReelBtn');
        if (previewReelBtn) {
            previewReelBtn.addEventListener('click', () => this.previewInstagramReel());
        }
    };

    AdminPanel.prototype.openInstagramReelModal = function(reel = null) {
        this.currentReelId = reel ? reel._id : null;
        const modal = document.getElementById('instagramReelModal');
        const modalTitle = document.getElementById('instagramReelModalTitle');
        const submitBtnText = document.getElementById('submitInstagramReelBtnText');

        if (reel) {
            modalTitle.textContent = 'Edit Instagram Reel';
            submitBtnText.textContent = 'Update Reel';
            document.getElementById('instagramReelUrl').value = reel.reelUrl;
            document.getElementById('instagramReelTitle').value = reel.title || '';
            
            // Load technologies as comma-separated string
            const techInput = document.getElementById('instagramReelTechnologies');
            if (techInput && reel.technologies && reel.technologies.length > 0) {
                techInput.value = reel.technologies.join(', ');
            }
        } else {
            modalTitle.textContent = 'Add Instagram Reel';
            submitBtnText.textContent = 'Save Reel';
            document.getElementById('instagramReelForm').reset();
        }

        modal.classList.add('active');
    };

    AdminPanel.prototype.closeInstagramReelModal = function() {
        document.getElementById('instagramReelModal').classList.remove('active');
        this.currentReelId = null;
    };

    AdminPanel.prototype.editInstagramReel = async function(reelId) {
        try {
            const response = await fetch(`/api/reels/${reelId}`);
            const reel = await response.json();
            if (reel) {
                this.openInstagramReelModal(reel);
            }
        } catch (error) {
            console.error('Error loading reel:', error);
            this.showNotification('Failed to load reel', 'error');
        }
    };

    AdminPanel.prototype.previewInstagramReel = function() {
        const url = document.getElementById('instagramReelUrl').value.trim();
        const previewContainer = document.getElementById('instagramReelPreview');
        
        if (!url) {
            this.showNotification('Please enter a URL first', 'error');
            return;
        }

        previewContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center;">Loading preview...</p>`;

        // Create Instagram embed preview
        setTimeout(() => {
            previewContainer.innerHTML = `
                <blockquote class="instagram-media" 
                            data-instgrm-permalink="${url}" 
                            data-instgrm-version="14"
                            style="background:#FFF; border:0; border-radius:3px; max-width:400px; margin: 0 auto;">
                </blockquote>
            `;
            
            // Load Instagram embed script if not already loaded
            if (!window.instgrm) {
                const script = document.createElement('script');
                script.async = true;
                script.src = '//www.instagram.com/embed.js';
                document.body.appendChild(script);
            } else {
                window.instgrm.Embeds.process();
            }
        }, 500);
    };

    // =========================
    // Commercial Work Management  
    // =========================
    // Client's Work Management
    // =========================

    
    AdminPanel.prototype.loadClientWork = async function() {
        const clientWorkList = document.getElementById('clientWorkList');
        
        if (!clientWorkList) return;
        
        clientWorkList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading client work...</p>';

        try {
            const response = await fetch('/api/client-work');
            const works = await response.json();
            
            clientWorkList.innerHTML = '';

            if (!works || works.length === 0) {
                clientWorkList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No client work added yet.</p>';
                return;
            }

            works.forEach(work => {
                const workElement = this.createClientWorkElement(work);
                clientWorkList.appendChild(workElement);
            });
        } catch (error) {
            console.error('Error loading client work:', error);
            clientWorkList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 3rem;">Failed to load client work.</p>';
        }
    };

    AdminPanel.prototype.createClientWorkElement = function(work) {
        const div = document.createElement('div');
        div.className = 'commercial-item';
        
        // Show logo count if available
        const logoCount = work.technologyLogos ? work.technologyLogos.length : 0;
        
        div.innerHTML = `
            <div class="commercial-info">
                <i class="fab fa-youtube"></i>
                <div>
                    <h4>${work.title}</h4>
                    <small>${work.brand} ${logoCount > 0 ? `• ${logoCount} tech ${logoCount === 1 ? 'logo' : 'logos'}` : ''}</small>
                    <p>${work.description}</p>
                </div>
            </div>
            <div class="commercial-actions">
                <button class="btn-edit" onclick="adminPanel.editClientWork('${work._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="adminPanel.deleteClientWork('${work._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        return div;
    };

    AdminPanel.prototype.saveClientWork = async function() {
        const form = document.getElementById('clientWorkForm');
        const formData = new FormData();
        
        // Get form values
        const youtubeUrl = document.getElementById('clientWorkYoutubeUrl')?.value.trim();
        const brand = document.getElementById('clientWorkBrand')?.value.trim();
        const title = document.getElementById('clientWorkTitle')?.value.trim();
        const description = document.getElementById('clientWorkDescription')?.value.trim();
        const engagement = document.getElementById('clientWorkEngagement')?.value.trim() || '';
        const revenue = document.getElementById('clientWorkRevenue')?.value.trim() || '';
        
        // Get technology logos
        const logoFiles = document.getElementById('clientWorkLogos')?.files;
        
        // Validation
        if (!youtubeUrl || !brand || !title || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!logoFiles || logoFiles.length === 0) {
            this.showNotification('Please upload at least 1 technology logo', 'error');
            return;
        }
        
        if (logoFiles.length > 10) {
            this.showNotification('Maximum 10 technology logos allowed', 'error');
            return;
        }
        
        // Append text fields
        formData.append('youtubeUrl', youtubeUrl);
        formData.append('brand', brand);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('engagement', engagement);
        formData.append('revenue', revenue);
        
        // Append logo files
        for (let i = 0; i < logoFiles.length; i++) {
            formData.append('technologyLogos', logoFiles[i]);
        }

        try {
            const url = this.currentClientWorkId ? `/api/client-work/${this.currentClientWorkId}` : '/api/client-work';
            const method = this.currentClientWorkId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formData // FormData, no Content-Type header needed
            });

            if (!response.ok) throw new Error('Failed to save client work');

            this.showNotification(this.currentClientWorkId ? 'Client work updated!' : 'Client work added!');
            this.loadClientWork();
            
            // Close modal and reset form
            document.getElementById('clientWorkModal').classList.remove('show');
            form.reset();
            document.getElementById('logoPreviewsContainer').style.display = 'none';
            document.getElementById('logoPreviews').innerHTML = '';
            
        } catch (error) {
            console.error('Error saving client work:', error);
            this.showNotification('Failed to save client work', 'error');
        }
    };

    AdminPanel.prototype.editClientWork = async function(workId) {
        // Load work data and populate form
        try {
            const response = await fetch(`/api/client-work/${workId}`);
            const work = await response.json();
            
            document.getElementById('clientWorkId').value = work._id;
            document.getElementById('clientWorkYoutubeUrl').value = work.youtubeUrl;
            document.getElementById('clientWorkBrand').value = work.brand;
            document.getElementById('clientWorkTitle').value = work.title;
            document.getElementById('clientWorkDescription').value = work.description;
            document.getElementById('clientWorkEngagement').value = work.engagement || '';
            document.getElementById('clientWorkRevenue').value = work.revenue || '';
            
            this.currentClientWorkId = work._id;
            
            document.getElementById('clientWorkModalTitle').textContent = 'Edit Client\'s Work';
            document.getElementById('submitClientWorkBtnText').textContent = 'Update Client\'s Work';
            document.getElementById('clientWorkModal').classList.add('show');
            
        } catch (error) {
            console.error('Error loading client work:', error);
            this.showNotification('Failed to load client work', 'error');
        }
    };

    AdminPanel.prototype.deleteClientWork = async function(workId) {
        if (confirm('Delete this client work? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/client-work/${workId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                this.loadClientWork();
                this.showNotification('Client work deleted!');
            } catch (error) {
                console.error('Error deleting work:', error);
                this.showNotification('Failed to delete work', 'error');
            }
        }
    };

    // ====================
    // Contact Settings
    // ====================
    
    AdminPanel.prototype.loadContactSettings = async function() {
        try {
            const response = await fetch('/api/contact');
            const contact = await response.json();
            
            if (contact) {
                document.getElementById('contactEmail').value = contact.email || '';
                document.getElementById('contactPhone').value = contact.phone || '';
                document.getElementById('contactLocation').value = contact.location || '';
                document.getElementById('contactYoutube').value = contact.socialMedia?.youtube || '';
                document.getElementById('contactInstagram').value = contact.socialMedia?.instagram || '';
                document.getElementById('contactTwitter').value = contact.socialMedia?.twitter || '';
                document.getElementById('contactLinkedin').value = contact.socialMedia?.linkedin || '';
            }
        } catch (error) {
            console.error('Error loading contact settings:', error);
            this.showNotification('Failed to load contact settings', 'error');
        }
    };

    AdminPanel.prototype.saveContactSettings = async function() {
        const contactData = {
            email: document.getElementById('contactEmail')?.value.trim(),
            phone: document.getElementById('contactPhone')?.value.trim(),
            location: document.getElementById('contactLocation')?.value.trim(),
            socialMedia: {
                youtube: document.getElementById('contactYoutube')?.value.trim() || '',
                instagram: document.getElementById('contactInstagram')?.value.trim() || '',
                twitter: document.getElementById('contactTwitter')?.value.trim() || '',
                linkedin: document.getElementById('contactLinkedin')?.value.trim() || ''
            }
        };

        if (!contactData.email) {
            this.showNotification('Email is required', 'error');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (!response.ok) throw new Error('Failed to save contact settings');

            this.showNotification('Contact settings saved!');
        } catch (error) {
            console.error('Error saving contact settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    };

    // =================
    // About Section
    // =================
    
    AdminPanel.prototype.loadAboutSection = async function() {
        try {
            const response = await fetch('/api/about');
            const about = await response.json();
            
            if (about) {
                document.getElementById('aboutHeading').value = about.heading || '';
                document.getElementById('aboutContent').value = about.content || '';
                document.getElementById('aboutProjects').value = about.statistics?.projects || 0;
                document.getElementById('aboutClients').value = about.statistics?.clients || 0;
                document.getElementById('aboutExperience').value = about.statistics?.experience || 0;
                document.getElementById('aboutProfileImage').value = about.profileImage || '';
            }
        } catch (error) {
            console.error('Error loading about section:', error);
            this.showNotification('Failed to load about section', 'error');
        }
    };

    AdminPanel.prototype.saveAboutSection = async function() {
        const content = document.getElementById('aboutContent')?.value.trim();

        if (!content) {
            this.showNotification('About content is required', 'error');
            return;
        }

        try {
            // Determine if user chose file upload or URL
            const profileImageType = document.querySelector('input[name="profileImageType"]:checked')?.value;
            const profileImageFile = document.getElementById('aboutProfileImageFile')?.files[0];
            const profileImageUrl = document.getElementById('aboutProfileImage')?.value.trim();

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('heading', document.getElementById('aboutHeading')?.value.trim());
            formData.append('content', content);
            formData.append('statistics', JSON.stringify({
                projects: parseInt(document.getElementById('aboutProjects')?.value) || 0,
                clients: parseInt(document.getElementById('aboutClients')?.value) || 0,
                experience: parseInt(document.getElementById('aboutExperience')?.value) || 0
            }));

            // Add profile image based on selection
            if (profileImageType === 'upload' && profileImageFile) {
                formData.append('profileImageFile', profileImageFile);
            } else if (profileImageType === 'url' && profileImageUrl) {
                formData.append('profileImage', profileImageUrl);
            }

            const response = await fetch('/api/about', {
                method: 'PUT',
                body: formData
                // Don't set Content-Type header - browser will set it with boundary
            });

            if (!response.ok) throw new Error('Failed to save about section');

            this.showNotification('About section saved!');
        } catch (error) {
            console.error('Error saving about section:', error);
            this.showNotification('Failed to save about section', 'error');
        }
    };

    // Update switchTab to load data for each section
    const originalSwitchTab = AdminPanel.prototype.switchTab;
    AdminPanel.prototype.switchTab = function(tab) {
        originalSwitchTab.call(this, tab);
        
        // Load data for the specific tab
        if (tab === 'instagram-reels') {
            this.loadInstagramReels();
        } else if (tab === 'commercial') {
            this.loadCommercialWork();
        } else if (tab === 'contact') {
            this.loadContactSettings();
        } else if (tab === 'about') {
            this.loadAboutSection();
        }
    };
    
    // Initialize event listeners after DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.adminPanel) {
                window.adminPanel.setupInstagramReelsEvents();
                window.adminPanel.setupContactAboutEvents();
            }
        }, 100);
    });
    
    // Event listeners for Contact and About forms
    AdminPanel.prototype.setupContactAboutEvents = function() {
        console.log('🔧 Setting up Contact and About events...');
        
        const contactForm = document.getElementById('contactSettingsForm');
        if (contactForm) {
            console.log('✅ Contact form found, attaching listener');
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveContactSettings();
            });
        } else {
            console.warn('⚠️ Contact form NOT found');
        }

        const aboutForm = document.getElementById('aboutSectionForm');
        if (aboutForm) {
            console.log('✅ About form found, attaching listener');
            aboutForm.addEventListener('submit', (e) => {
                console.log('📝 About form submitted!');
                e.preventDefault();
                this.saveAboutSection();
            });
        } else {
            console.warn('⚠️ About form NOT found');
        }
    };
    
    console.log('✅ Admin panel extensions loaded successfully');
}
