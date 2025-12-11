// ============================================
// Client's Work Event Listeners & UI Logic
// ============================================

(function() {
    'use strict';

    let isSetup = false; // Guard flag to prevent multiple setups

    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 Client Work: DOM Content Loaded');
        
        // Try immediate setup
        setupClientWorkEvents();
        
        // Also try with delay as fallback only if first attempt failed
        setTimeout(function() {
            if (!isSetup) {
                console.log('🔧 Client Work: Retry setup after 500ms');
                setupClientWorkEvents();
            }
        }, 500);
    });

    function setupClientWorkEvents() {
        if (isSetup) {
            console.log('⏭️ Client Work already set up, skipping');
            return;
        }
        
        console.log('🔧 Setting up Client Work events...');
        
        // Add Client Work button
        const addClientWorkBtn = document.getElementById('addClientWorkBtn');
        if (addClientWorkBtn) {
            console.log('✅ Found addClientWorkBtn, attaching listener');
            // Remove any existing listeners
            addClientWorkBtn.onclick = null;
            addClientWorkBtn.addEventListener('click', openClientWorkModal);
        } else {
            console.warn('❌ addClientWorkBtn not found');
        }


        // Refresh button
        const refreshClientWorkBtn = document.getElementById('refreshClientWorkBtn');
        if (refreshClientWorkBtn) {
            console.log('✅ Found refreshClientWorkBtn');
            refreshClientWorkBtn.addEventListener('click', () => {
                if (window.adminPanel && window.adminPanel.loadClientWork) {
                    window.adminPanel.loadClientWork();
                } else {
                    console.error('AdminPanel.loadClientWork not available');
                }
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

        // Form submit - ONLY ADD ONCE
        const clientWorkForm = document.getElementById('clientWorkForm');
        if (clientWorkForm) {
            console.log('✅ Attaching form submit listener');
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
        
        // Mark as set up
        isSetup = true;
        console.log('✅ Client Work setup complete');
    }

    function openClientWorkModal() {
        console.log('🎬 Opening Client Work Modal...');
        
        const modal = document.getElementById('clientWorkModal');
        const form = document.getElementById('clientWorkForm');
        
        if (!modal) {
            console.error('❌ clientWorkModal not found!');
            return;
        }
        
        if (!form) {
            console.error('❌ clientWorkForm not found!');
            return;
        }
        
        console.log('✅ Modal and form found');
        
        // Reset form
        form.reset();
        document.getElementById('clientWorkId').value = '';
        
        // Reset currentClientWorkId on adminPanel if available
        if (window.adminPanel) {
            window.adminPanel.currentClientWorkId = null;
        }
        
        // Clear logo previews
        const previewContainer = document.getElementById('logoPreviewsContainer');
        const previews = document.getElementById('logoPreviews');
        if (previewContainer) previewContainer.style.display = 'none';
        if (previews) previews.innerHTML = '';
        
        // Update modal title
        const modalTitle = document.getElementById('clientWorkModalTitle');
        const submitBtnText = document.getElementById('submitClientWorkBtnText');
        if (modalTitle) modalTitle.textContent = 'Add Client\'s Work';
        if (submitBtnText) submitBtnText.textContent = 'Save Client\'s Work';
        
        // Show modal
        modal.classList.add('show');
        console.log('✅ Modal shown with class "show"');
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
