// ============================================
// Client's Work Event Listeners & UI Logic
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Wait for adminPanel to be initialized
        setTimeout(function() {
            setupClientWorkEvents();
        }, 100);
    });

    function setupClientWorkEvents() {
        if (!window.adminPanel) {
            console.warn('AdminPanel not initialized yet');
            return;
        }

        // Add Client Work button
        const addClientWorkBtn = document.getElementById('addClientWorkBtn');
        if (addClientWorkBtn) {
            addClientWorkBtn.addEventListener('click', openClientWorkModal);
        }

        // Refresh button
        const refreshClientWorkBtn = document.getElementById('refreshClientWorkBtn');
        if (refreshClientWorkBtn) {
            refreshClientWorkBtn.addEventListener('click', () => {
                window.adminPanel.loadClientWork();
            });
        }

        // Close modal button
        const closeClientWorkModal = document.getElementById('closeClientWorkModal');
        if (closeClientWorkModal) {
            closeClientWorkModal.addEventListener('click', closeModal);
        }

        // Cancel button
        const cancelClientWorkBtn = document.getElementById('cancelClientWorkBtn');
        if (cancelClientWorkBtn) {
            cancelClientWorkBtn.addEventListener('click', closeModal);
        }

        // Form submit
        const clientWorkForm = document.getElementById('clientWorkForm');
        if (clientWorkForm) {
            clientWorkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.adminPanel.saveClientWork();
            });
        }

        // Logo file input change - show previews
        const clientWorkLogos = document.getElementById('clientWorkLogos');
        if (clientWorkLogos) {
            clientWorkLogos.addEventListener('change', handleLogoSelection);
        }

        // Clear logos button
        const clearLogosBtn = document.getElementById('clearLogosBtn');
        if (clearLogosBtn) {
            clearLogosBtn.addEventListener('click', clearLogoSelection);
        }

        // Preview video button
        const previewClientWorkVideoBtn = document.getElementById('previewClientWorkVideoBtn');
        if (previewClientWorkVideoBtn) {
            previewClientWorkVideoBtn.addEventListener('click', previewYouTubeVideo);
        }

        // Load client work when switching to this tab
        const clientsWorkTab = document.querySelector('[data-tab="clientsWork"]');
        if (clientsWorkTab) {
            clientsWorkTab.addEventListener('click', () => {
                setTimeout(() => {
                    window.adminPanel.loadClientWork();
                }, 50);
            });
        }
    }

    function openClientWorkModal() {
        const modal = document.getElementById('clientWorkModal');
        const form = document.getElementById('clientWorkForm');
        
        // Reset form
        form.reset();
        document.getElementById('clientWorkId').value = '';
        window.adminPanel.currentClientWorkId = null;
        
        // Clear logo previews
        document.getElementById('logoPreviewsContainer').style.display = 'none';
        document.getElementById('logoPreviews').innerHTML = '';
        
        // Update modal title
        document.getElementById('clientWorkModalTitle').textContent = 'Add Client\'s Work';
        document.getElementById('submitClientWorkBtnText').textContent = 'Save Client\'s Work';
        
        // Show modal
        modal.classList.add('show');
    }

    function closeModal() {
        const modal = document.getElementById('clientWorkModal');
        modal.classList.remove('show');
    }

    function handleLogoSelection(e) {
        const files = e.target.files;
        const previewsContainer = document.getElementById('logoPreviewsContainer');
        const previewsGrid = document.getElementById('logoPreviews');
        
        if (!files || files.length === 0) {
            previewsContainer.style.display = 'none';
            return;
        }
        
        if (files.length > 10) {
            window.adminPanel.showNotification('Maximum 10 logos allowed. Only first 10 will be used.', 'error');
        }
        
        // Clear existing previews
        previewsGrid.innerHTML = '';
        
        // Show preview container
        previewsContainer.style.display = 'block';
        
        // Create previews for each file (max 10)
        const filesToShow = Math.min(files.length, 10);
        for (let i = 0; i < filesToShow; i++) {
            const file = files[i];
            
            // Validate file type
            if (!file.type.match('image.*')) {
                continue;
            }
            
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                window.adminPanel.showNotification(`${file.name} is too large (max 2MB)`, 'error');
                continue;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const previewDiv = document.createElement('div');
                previewDiv.style.cssText = 'position: relative; width: 100%; aspect-ratio: 1; border: 2px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; background: var(--bg-darker);';
                
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; padding: 8px;';
                
                const fileName = document.createElement('span');
                fileName.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
                fileName.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; font-size: 0.7rem; padding: 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
                
                previewDiv.appendChild(img);
                previewDiv.appendChild(fileName);
                previewsGrid.appendChild(previewDiv);
            };
            reader.readAsDataURL(file);
        }
    }

    function clearLogoSelection() {
        const fileInput = document.getElementById('clientWorkLogos');
        fileInput.value = '';
        
        document.getElementById('logoPreviewsContainer').style.display = 'none';
        document.getElementById('logoPreviews').innerHTML = '';
    }

    function previewYouTubeVideo() {
        const youtubeUrl = document.getElementById('clientWorkYoutubeUrl')?.value.trim();
        const previewDiv = document.getElementById('clientWorkYoutubePreview');
        
        if (!youtubeUrl) {
            window.adminPanel.showNotification('Please enter a YouTube URL first', 'error');
            return;
        }
        
        // Extract video ID
        let videoId = null;
        let match = youtubeUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
        if (match) {
            videoId = match[1];
        } else {
            match = youtubeUrl.match(/[?&]v=([A-Za-z0-9_-]+)/);
            if (match) {
                videoId = match[1];
            }
        }
        
        if (!videoId) {
            window.adminPanel.showNotification('Invalid YouTube URL', 'error');
            return;
        }
        
        // Show iframe preview
        previewDiv.innerHTML = `
            <iframe 
                width="100%" 
                height="315" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="border-radius: 8px;"
            ></iframe>
        `;
    }

})();
