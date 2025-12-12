// ============================================
// Ratings Admin Management
// ============================================

(function() {
    'use strict';

    let isSetup = false;

    document.addEventListener('DOMContentLoaded', function() {
        setupRatingsAdmin();
        
        // Load ratings when tab is clicked
        const ratingsTab = document.querySelector('[data-tab="ratings"]');
        if (ratingsTab) {
            ratingsTab.addEventListener('click', () => {
                setTimeout(() => {
                    if (window.adminPanel && window.adminPanel.loadRatings) {
                        window.adminPanel.loadRatings();
                    }
                }, 50);
            });
        }
    });

    function setupRatingsAdmin() {
        if (isSetup) {
            console.log('⏭️ Ratings admin already set up');
            return;
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshRatingsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (window.adminPanel && window.adminPanel.loadRatings) {
                    window.adminPanel.loadRatings();
                }
            });
        }

        isSetup = true;
        console.log('✅ Ratings admin setup complete');
    }

})();

// Add ratings management to AdminPanel prototype
if (typeof AdminPanel !== 'undefined') {
    
    // Load all ratings
    AdminPanel.prototype.loadRatings = async function() {
        try {
            const response = await fetch('/api/ratings');
            if (!response.ok) throw new Error('Failed to load ratings');
            
            const ratings = await response.json();
            
            // Separate pending and approved
            const pending = ratings.filter(r => !r.isApproved);
            const approved = ratings.filter(r => r.isApproved);
            
            // Update counts
            document.getElementById('pendingCount').textContent = pending.length;
            document.getElementById('approvedCount').textContent = approved.length;
            
            // Render lists
            renderRatingsList('pendingRatingsList', pending, false);
            renderRatingsList('approvedRatingsList', approved, true);
            
            console.log(`✅ Loaded ${ratings.length} ratings (${pending.length} pending, ${approved.length} approved)`);
            
        } catch (error) {
            console.error('Error loading ratings:', error);
            this.showNotification('Failed to load ratings', 'error');
        }
    };

    // Render ratings list
    function renderRatingsList(containerid, ratings, isApproved) {
        const container = document.getElementById(containerid);
        
        if (!ratings || ratings.length === 0) {
            container.innerHTML = `
                <div class="empty-placeholder">
                    <i class="fas fa-${isApproved ? 'star' : 'inbox'}"></i>
                    <p>No ${isApproved ? 'approved' : 'pending'} ratings</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        ratings.forEach(rating => {
            const card = createRatingAdminCard(rating, isApproved);
            container.appendChild(card);
        });
    }

    function createRatingAdminCard(rating, isApproved) {
        const div = document.createElement('div');
        div.className = 'rating-admin-card';
        
        //Generate stars
        const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
        
        // Logo or avatar
        const logoHTML = rating.userLogo 
            ? `<img src="${rating.userLogo}" alt="${rating.userName}" class="rating-admin-logo">` 
            : `<div class="rating-admin-avatar">${rating.userName.charAt(0).toUpperCase()}</div>`;
        
        const date = new Date(rating.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
        });
        
        div.innerHTML = `
            <div class="rating-admin-header">
                ${logoHTML}
                <div class="rating-admin-info">
                    <h4>${rating.userName}</h4>
                    <div class="rating-admin-stars">${stars}</div>
                    <small>${date}</small>
                </div>
            </div>
            <p class="rating-admin-description">${rating.description}</p>
            <div class="rating-admin-actions">
                ${!isApproved ? `
                    <button class="btn-small btn-primary" onclick="window.adminPanel.approveRating('${rating._id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-small btn-delete" onclick="window.adminPanel.deleteRating('${rating._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : `
                    <button class="btn-small btn-secondary" onclick="window.adminPanel.unapproveRating('${rating._id}')">
                        <i class="fas fa-times"></i> Unapprove
                    </button>
                    <button class="btn-small btn-delete" onclick="window.adminPanel.deleteRating('${rating._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                `}
            </div>
        `;
        
        return div;
    }

    // Approve rating
    AdminPanel.prototype.approveRating = async function(ratingId) {
        try {
            const response = await fetch(`/api/ratings/${ratingId}/approve`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.showNotification('Rating approved!', 'success');
                this.loadRatings();
            } else {
                throw new Error('Failed to approve');
            }
        } catch (error) {
            console.error('Error approving rating:', error);
            this.showNotification('Failed to approve rating', 'error');
        }
    };

    // Unapprove rating
    AdminPanel.prototype.unapproveRating = async function(ratingId) {
        try {
            const response = await fetch(`/api/ratings/${ratingId}/approve`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.showNotification('Rating unapproved!', 'success');
                this.loadRatings();
            } else {
                throw new Error('Failed to unapprove');
            }
        } catch (error) {
            console.error('Error unapproving rating:', error);
            this.showNotification('Failed to unapprove rating', 'error');
        }
    };

    // Delete rating
    AdminPanel.prototype.deleteRating = async function(ratingId) {
        if (!confirm('Are you sure you want to delete this rating? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/ratings/${ratingId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Rating deleted!', 'success');
                this.loadRatings();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting rating:', error);
            this.showNotification('Failed to delete rating', 'error');
        }
    };
}
