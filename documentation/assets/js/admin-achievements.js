// ============================================
// Admin Achievements Management
// ============================================

(function() {
    'use strict';

    let achievements = [];
    let currentAdminProfile = { name: 'Admin', profilePic: '' };
    let editingAchievementId = null;

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('achievementsTab')) {
            initAchievements();
        }
    });

    function initAchievements() {
        loadAchievements();
        loadAdminProfile();
        setupEventListeners();
    }

    // Load achievements from API
    async function loadAchievements() {
        try {
            const response = await fetch('/api/achievements');
            if (!response.ok) throw new Error('Failed to load achievements');

            achievements = await response.json();
            renderAchievementsList();
            console.log(`✅ Loaded ${achievements.length} achievements`);

        } catch (error) {
            console.error('Error loading achievements:', error);
            showNotification('Failed to load achievements', 'error');
        }
    }

    // Load admin profile
    async function loadAdminProfile() {
        try {
            const response = await fetch('/api/achievements');
            if (!response.ok) return;

            const data = await response.json();
            if (data.length > 0 && data[0].adminName) {
                currentAdminProfile = {
                    name: data[0].adminName,
                    profilePic: data[0].adminProfilePic || ''
                };
                updateAdminProfileUI();
            }
        } catch (error) {
            console.error('Error loading admin profile:', error);
        }
    }

    // Update admin profile UI
    function updateAdminProfileUI() {
        const nameInput = document.getElementById('adminName');
        const preview = document.getElementById('adminProfilePreview');

        if (nameInput) nameInput.value = currentAdminProfile.name;

        if (preview && currentAdminProfile.profilePic) {
            preview.innerHTML = `<img src="${currentAdminProfile.profilePic}" alt="Admin">`;
        }
    }

    // Render achievements list
    function renderAchievementsList() {
        const container = document.getElementById('achievementsList');
        if (!container) return;

        if (achievements.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-trophy"></i>
                    <p>No achievements yet. Add your first achievement!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item" data-id="${achievement._id}">
                <img src="${achievement.achievementImage}" alt="Achievement" class="achievement-item-image">
                <div class="achievement-item-content">
                    <p class="achievement-item-description">${escapeHtml(achievement.description)}</p>
                    <div class="achievement-item-actions">
                        <button class="btn-icon btn-edit" onclick="editAchievement('${achievement._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteAchievement('${achievement._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Add achievement button
        const addBtn = document.getElementById('addAchievementBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => openAchievementModal());
        }

        // Save admin profile
        const saveProfileBtn = document.getElementById('saveAdminProfile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', saveAdminProfile);
        }

        // Admin profile pic upload
        const profilePicInput = document.getElementById('adminProfilePic');
        if (profilePicInput) {
            profilePicInput.addEventListener('change', handleProfilePicUpload);
        }

        // Achievement form
        const achievementForm = document.getElementById('achievementForm');
        if (achievementForm) {
            achievementForm.addEventListener('submit', saveAchievement);
        }

        // Image preview
        const imageInput = document.getElementById('achievementImage');
        if (imageInput) {
            imageInput.addEventListener('change', handleImagePreview);
        }

        // Description character count
        const descInput = document.getElementById('achievementDescription');
        if (descInput) {
            descInput.addEventListener('input', updateCharacterCount);
        }

        // Modal controls
        const modalClose = document.getElementById('achievementModalClose');
        const cancelBtn = document.getElementById('achievementCancelBtn');
        if (modalClose) modalClose.addEventListener('click', closeAchievementModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeAchievementModal);
    }

    // Open achievement modal
    window.openAchievementModal = function(achievementId = null) {
        const modal = document.getElementById('achievementModal');
        const form = document.getElementById('achievementForm');
        const title = document.getElementById('achievementModalTitle');

        if (achievementId) {
            const achievement = achievements.find(a => a._id === achievementId);
            if (!achievement) return;

            title.textContent = 'Edit Achievement';
            document.getElementById('achievementId').value = achievement._id;
            document.getElementById('achievementDescription').value = achievement.description;
            document.getElementById('achievementOrder').value = achievement.order || 0;
            document.getElementById('achievementImage').required = false;
            editingAchievementId = achievementId;
        } else {
            title.textContent = 'Add Achievement';
            form.reset();
            document.getElementById('achievementImage').required = true;
            editingAchievementId = null;
        }

        modal.style.display = 'flex';
        updateCharacterCount();
    };

    // Close modal
    function closeAchievementModal() {
        const modal = document.getElementById('achievementModal');
        const form = document.getElementById('achievementForm');
        const preview = document.getElementById('achievementImagePreview');

        modal.style.display = 'none';
        form.reset();
        preview.style.display = 'none';
        editingAchievementId = null;
    }

    // Save achievement
    async function saveAchievement(e) {
        e.preventDefault();

        const formData = new FormData();
        const description = document.getElementById('achievementDescription').value.trim();
        const order = document.getElementById('achievementOrder').value;
        const imageFile = document.getElementById('achievementImage').files[0];

        formData.append('description', description);
        formData.append('order', order);
        formData.append('adminName', currentAdminProfile.name);
        formData.append('adminProfilePic', currentAdminProfile.profilePic);

        if (imageFile) {
            formData.append('achievementImage', imageFile);
        }

        try {
            const url = editingAchievementId 
                ? `/api/achievements/${editingAchievementId}`
                : '/api/achievements';
            
            const method = editingAchievementId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (!response.ok) throw new Error('Failed to save achievement');

            const result = await response.json();
            showNotification(result.message || 'Achievement saved successfully', 'success');
            
            closeAchievementModal();
            loadAchievements();

        } catch (error) {
            console.error('Error saving achievement:', error);
            showNotification('Failed to save achievement', 'error');
        }
    }

    // Edit achievement
    window.editAchievement = function(id) {
        openAchievementModal(id);
    };

    // Delete achievement
    window.deleteAchievement = async function(id) {
        if (!confirm('Are you sure you want to delete this achievement?')) return;

        try {
            const response = await fetch(`/api/achievements/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete achievement');

            showNotification('Achievement deleted successfully', 'success');
            loadAchievements();

        } catch (error) {
            console.error('Error deleting achievement:', error);
            showNotification('Failed to delete achievement', 'error');
        }
    };

    // Save admin profile
    async function saveAdminProfile() {
        const name = document.getElementById('adminName').value.trim();

        if (!name) {
            showNotification('Admin name is required', 'error');
            return;
        }

        currentAdminProfile.name = name;
        showNotification('Admin profile saved! It will apply to new achievements.', 'success');
    }

    // Handle profile pic upload
    function handleProfilePicUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePic', file);

        // For now, use a simple file reader to preview
        const reader = new FileReader();
        reader.onload = (e) => {
            currentAdminProfile.profilePic = e.target.result;
            updateAdminProfileUI();
            showNotification('Profile picture updated', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Handle image preview
    function handleImagePreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('achievementImagePreview');

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.querySelector('img').src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    }

    // Update character count
    function updateCharacterCount() {
        const input = document.getElementById('achievementDescription');
        const counter = document.getElementById('descriptionCount');
        if (input && counter) {
            counter.textContent = input.value.length;
        }
    }

    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'success') {
        if (window.AdminPanel && window.AdminPanel.prototype.showNotification) {
            const panel = new window.AdminPanel();
            panel.showNotification(message, type);
        } else {
            alert(message);
        }
    }

})();
