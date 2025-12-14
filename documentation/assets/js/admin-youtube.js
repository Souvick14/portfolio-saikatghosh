// ============================================
// YouTube Videos Management - Admin Panel
// ============================================

if (typeof AdminPanel !== 'undefined') {
    
    // Load YouTube videos
    AdminPanel.prototype.loadYouTubeVideos = async function() {
        const videosList = document.getElementById('youtubeVideosList');
        
        if (!videosList) return;
        
        videosList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading YouTube videos...</p>';

        try {
            const response = await fetch('/api/youtube');
            const videos = await response.json();
            
            videosList.innerHTML = '';

            if (!videos || videos.length === 0) {
                videosList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No YouTube videos added yet.</p>';
                return;
            }

            videos.forEach(video => {
                const videoElement = this.createYouTubeVideoElement(video);
                videosList.appendChild(videoElement);
            });
        } catch (error) {
            console.error('Error loading YouTube videos:', error);
            videosList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 3rem;">Failed to load YouTube videos.</p>';
        }
    };

    // Create video element for list
    AdminPanel.prototype.createYouTubeVideoElement = function(video) {
        const div = document.createElement('div');
        div.className = 'reel-item';
        div.innerHTML = `
            <div class="reel-info">
                <i class="fab fa-youtube" style="color: #FF0000;"></i>
                <div>
                    <h4>${video.title}</h4>
                    <small>Video ID: ${video.videoId}</small>
                    ${video.category ? `<span class="badge">${video.category}</span>` : ''}
                </div>
            </div>
            <div class="reel-actions">
                <button class="btn-edit" data-video-id="${video._id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" data-video-id="${video._id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        const editBtn = div.querySelector('.btn-edit');
        const deleteBtn = div.querySelector('.btn-delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editYouTubeVideo(video._id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteYouTubeVideo(video._id));
        }
        
        return div;
    };

    // Extract YouTube video ID from URL
    AdminPanel.prototype.extractYouTubeVideoId = function(url) {
        if (!url) return null;
        
        // Support various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([A-Za-z0-9_-]{11})$/ // Direct video ID
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return null;
    };

    // Save YouTube video
    AdminPanel.prototype.saveYouTubeVideo = async function() {
        const url = document.getElementById('youtubeVideoUrl')?.value.trim();
        const title = document.getElementById('youtubeVideoTitle')?.value.trim();
        const description = document.getElementById('youtubeVideoDescription')?.value.trim();
        const category = document.getElementById('youtubeVideoCategory')?.value;
        const order = parseInt(document.getElementById('youtubeVideoOrder')?.value) || 0;

        if (!url || !title) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Extract video ID
        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
            this.showNotification('Invalid YouTube URL. Please check and try again.', 'error');
            return;
        }

        const videoData = {
            videoId: videoId,
            title: title,
            description: description,
            category: category,
            order: order,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };

        // Get Genre
        if (window.AdminGenres && window.AdminGenres.getSelectedGenre) {
            videoData.genre = await window.AdminGenres.getSelectedGenre('youtubeGenre', 'youtubeCustomGenre');
        }

        try {
            const apiUrl = this.currentYouTubeVideoId 
                ? `/api/youtube/${this.currentYouTubeVideoId}` 
                : '/api/youtube';
            const method = this.currentYouTubeVideoId ? 'PUT' : 'POST';
            
            const response = await fetch(apiUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoData)
            });

            if (!response.ok) throw new Error('Failed to save YouTube video');

            this.showNotification(this.currentYouTubeVideoId ? 'Video updated!' : 'Video added!');
            this.closeYouTubeVideoModal();
            this.loadYouTubeVideos();
        } catch (error) {
            console.error('Error saving YouTube video:', error);
            this.showNotification('Failed to save video', 'error');
        }
    };

    // Edit YouTube video
    AdminPanel.prototype.editYouTubeVideo = async function(videoId) {
        try {
            const response = await fetch(`/api/youtube/${videoId}`);
            const video = await response.json();
            if (video) {
                this.openYouTubeVideoModal(video);
            }
        } catch (error) {
            console.error('Error loading video:', error);
            this.showNotification('Failed to load video', 'error');
        }
    };

    // Delete YouTube video
    AdminPanel.prototype.deleteYouTubeVideo = async function(videoId) {
        if (confirm('Delete this YouTube video?')) {
            try {
                const response = await fetch(`/api/youtube/${videoId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                this.loadYouTubeVideos();
                this.showNotification('Video deleted!');
            } catch (error) {
                console.error('Error deleting video:', error);
                this.showNotification('Failed to delete video', 'error');
            }
        }
    };

    // Open modal
    AdminPanel.prototype.openYouTubeVideoModal = function(video = null) {
        this.currentYouTubeVideoId = video ? video._id : null;
        const modal = document.getElementById('youtubeVideoModal');
        const modalTitle = document.getElementById('youtubeVideoModalTitle');
        const submitBtnText = document.getElementById('submitYoutubeVideoBtnText');

        if (video) {
            modalTitle.textContent = 'Edit YouTube Video';
            submitBtnText.textContent = 'Update Video';
            document.getElementById('youtubeVideoUrl').value = `https://www.youtube.com/watch?v=${video.videoId}`;
            document.getElementById('youtubeVideoTitle').value = video.title || '';
            document.getElementById('youtubeVideoDescription').value = video.description || '';
            document.getElementById('youtubeVideoCategory').value = video.category || 'other';
            document.getElementById('youtubeVideoOrder').value = video.order || 0;
        } else {
            modalTitle.textContent = 'Add YouTube Video';
            submitBtnText.textContent = 'Save Video';
            document.getElementById('youtubeVideoForm').reset();
        }

        modal.classList.add('active');
    };

    // Close modal
    AdminPanel.prototype.closeYouTubeVideoModal = function() {
        document.getElementById('youtubeVideoModal').classList.remove('active');
        this.currentYouTubeVideoId = null;
    };

    // Preview video
    AdminPanel.prototype.previewYouTubeVideo = function() {
        const url = document.getElementById('youtubeVideoUrl').value.trim();
        const previewContainer = document.getElementById('youtubeVideoPreview');
        
        if (!url) {
            this.showNotification('Please enter a YouTube URL first', 'error');
            return;
        }

        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
            this.showNotification('Invalid YouTube URL', 'error');
            return;
        }

        previewContainer.innerHTML = `
            <iframe width="100%" height="315" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="border-radius: 8px;">
            </iframe>
        `;
    };

    // Setup event listeners
    AdminPanel.prototype.setupYouTubeVideosEvents = function() {
        const addBtn = document.getElementById('addYouTubeVideoBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openYouTubeVideoModal());
        }

        const closeBtn = document.getElementById('closeYoutubeVideoModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeYouTubeVideoModal());
        }

        const cancelBtn = document.getElementById('cancelYoutubeVideoBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeYouTubeVideoModal());
        }

        const form = document.getElementById('youtubeVideoForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveYouTubeVideo();
            });
        }

        const refreshBtn = document.getElementById('refreshYouTubeVideosBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadYouTubeVideos());
        }

        const previewBtn = document.getElementById('previewYoutubeVideoBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewYouTubeVideo());
        }
    };

    // Update switchTab to load YouTube videos
    const originalSwitchTab = AdminPanel.prototype.switchTab;
    AdminPanel.prototype.switchTab = function(tab) {
        if (originalSwitchTab) {
            originalSwitchTab.call(this, tab);
        }
        
        // Load data for the specific tab
        if (tab === 'reels') {
            this.loadYouTubeVideos();
        }
    };
    
    // Initialize YouTube videos events on page load
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.adminPanel) {
                window.adminPanel.setupYouTubeVideosEvents();
            }
        }, 100);
    });
    
    console.log('✅ YouTube Videos management loaded');
}
