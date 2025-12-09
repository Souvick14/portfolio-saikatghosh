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
                <button class="btn-edit" onclick="adminPanel.editInstagramReel('${reel._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="adminPanel.deleteInstagramReel('${reel._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        return div;
    };

    AdminPanel.prototype.saveInstagramReel = async function() {
        const reelUrl = document.getElementById('instagramReelUrl')?.value.trim();
        const reelTitle = document.getElementById('instagramReelTitle')?.value.trim();

        if (!reelUrl) {
            this.showNotification('Please enter an Instagram reel URL', 'error');
            return;
        }

        try {
            const reelData = { reelUrl, title: reelTitle };
            const url = this.currentReelId ? `/api/reels/${this.currentReelId}` : '/api/reels';
            const method = this.currentReelId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reelData)
            });

            if (!response.ok) throw new Error('Failed to save Instagram reel');

            this.showNotification(this.currentReelId ? 'Reel updated!' : 'Reel added!');
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

    // =========================
    // Commercial Work Management  
    // =========================
    
    AdminPanel.prototype.loadCommercialWork = async function() {
        const commercialList = document.getElementById('commercialWorkList');
        
        if (!commercialList) return;
        
        commercialList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading commercial work...</p>';

        try {
            const response = await fetch('/api/commercial');
            const works = await response.json();
            
            commercialList.innerHTML = '';

            if (!works || works.length === 0) {
                commercialList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No commercial work added yet.</p>';
                return;
            }

            works.forEach(work => {
                const workElement = this.createCommercialWorkElement(work);
                commercialList.appendChild(workElement);
            });
        } catch (error) {
            console.error('Error loading commercial work:', error);
            commercialList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 3rem;">Failed to load commercial work.</p>';
        }
    };

    AdminPanel.prototype.createCommercialWorkElement = function(work) {
        const div = document.createElement('div');
        div.className = 'commercial-item';
        div.innerHTML = `
            <div class="commercial-info">
                <i class="fab fa-youtube"></i>
                <div>
                    <h4>${work.title}</h4>
                    <small>${work.brand}</small>
                    <p>${work.description}</p>
                </div>
            </div>
            <div class="commercial-actions">
                <button class="btn-edit" onclick="adminPanel.editCommercialWork('${work._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="adminPanel.deleteCommercialWork('${work._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        return div;
    };

    AdminPanel.prototype.saveCommercialWork = async function() {
        const workData = {
            youtubeUrl: document.getElementById('commercialYoutubeUrl')?.value.trim(),
            brand: document.getElementById('commercialBrand')?.value.trim(),
            title: document.getElementById('commercialTitle')?.value.trim(),
            description: document.getElementById('commercialDescription')?.value.trim(),
            engagement: document.getElementById('commercialEngagement')?.value.trim() || '',
            revenue: document.getElementById('commercialRevenue')?.value.trim() || ''
        };

        if (!workData.youtubeUrl || !workData.brand || !workData.title || !workData.description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            const url = this.currentCommercialId ? `/api/commercial/${this.currentCommercialId}` : '/api/commercial';
            const method = this.currentCommercialId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workData)
            });

            if (!response.ok) throw new Error('Failed to save commercial work');

            this.showNotification(this.currentCommercialId ? 'Work updated!' : 'Work added!');
            this.loadCommercialWork();
        } catch (error) {
            console.error('Error saving commercial work:', error);
            this.showNotification('Failed to save work', 'error');
        }
    };

    AdminPanel.prototype.deleteCommercialWork = async function(workId) {
        if (confirm('Delete this commercial work?')) {
            try {
                const response = await fetch(`/api/commercial/${workId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                this.loadCommercialWork();
                this.showNotification('Work deleted!');
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
        const aboutData = {
            heading: document.getElementById('aboutHeading')?.value.trim(),
            content: document.getElementById('aboutContent')?.value.trim(),
            statistics: {
                projects: parseInt(document.getElementById('aboutProjects')?.value) || 0,
                clients: parseInt(document.getElementById('aboutClients')?.value) || 0,
                experience: parseInt(document.getElementById('aboutExperience')?.value) || 0
            },
            profileImage: document.getElementById('aboutProfileImage')?.value.trim()
        };

        if (!aboutData.content) {
            this.showNotification('About content is required', 'error');
            return;
        }

        try {
            const response = await fetch('/api/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutData)
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
        if (tab === 'instagramReels') {
            this.loadInstagramReels();
        } else if (tab === 'commercial') {
            this.loadCommercialWork();
        } else if (tab === 'contact') {
            this.loadContactSettings();
        } else if (tab === 'about') {
            this.loadAboutSection();
        }
    };
    
    console.log('✅ Admin panel extensions loaded successfully');
}
