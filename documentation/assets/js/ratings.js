// ============================================
// Ratings - Frontend Display & Submission
// ============================================

(function() {
    'use strict';

    let ratings = [];

    document.addEventListener('DOMContentLoaded', function() {
        loadRatings();
        setupRatingForm();
    });

    // ============================================
    // Load and Display Ratings
    // ============================================

    async function loadRatings() {
        const grid = document.getElementById('ratingsGrid');
        
        if (!grid) return;

        try {
            const response = await fetch('/api/ratings/approved');
            
            if (!response.ok) {
                throw new Error('Failed to load ratings');
            }

            ratings = await response.json();
            
            // Clear loading state
            grid.innerHTML = '';

            if (!ratings || ratings.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                        <i class="fas fa-star" style="font-size: 4rem; color: var(--primary-purple); opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary); font-size: 1.125rem;">No ratings yet. Be the first to share your experience!</p>
                    </div>
                `;
                return;
            }

            // Render rating cards
            ratings.forEach(rating => {
                const card = createRatingCard(rating);
                grid.appendChild(card);
            });
            
            console.log(`✅ Loaded ${ratings.length} ratings`);

        } catch (error) {
            console.error('Error loading ratings:', error);
            grid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--error); opacity: 0.5; margin-bottom: 1rem;"></i>
                    <p style="color: var(--error);">Failed to load ratings</p>
                </div>
            `;
        }
    }

    function createRatingCard(rating) {
        const card = document.createElement('div');
        card.className = 'rating-card';
        
        // Generate stars
        const starsHTML = generateStars(rating.rating);
        
        // Logo display
        const logoHTML = rating.userLogo 
            ? `<img src="${rating.userLogo}" alt="${rating.userName}" class="rating-logo">` 
            : `<div class="rating-avatar">${rating.userName.charAt(0).toUpperCase()}</div>`;
        
        card.innerHTML = `
            <div class="rating-header">
                ${logoHTML}
                <div class="rating-user-info">
                    <h4 class="rating-user-name">${rating.userName}</h4>
                    <div class="rating-stars">${starsHTML}</div>
                </div>
            </div>
            <p class="rating-description">${rating.description}</p>
            <small class="rating-date">${formatDate(rating.createdAt)}</small>
        `;
        
        return card;
    }

    function generateStars(rating) {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return `<span class="stars-filled">${fullStars}</span><span class="stars-empty">${emptyStars}</span>`;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // ============================================
    // Rating Form Submission button open
    // ============================================

    let rateMyWorkBtn = document.getElementById('ratemywork');
    let ratingcheck=true;
    rateMyWorkBtn.addEventListener('click', function() {
        if(ratingcheck){
            rateMyWorkBtn.textContent = "Close";
            let ratingFormContainer = document.querySelector('.rating-submission-container');
            ratingFormContainer.style.display = 'block';
            ratingFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            rateMyWorkBtn.style.border="2px solid black";
            rateMyWorkBtn.style.backgroundImage="transparent";
            ratingcheck=false;
        }else{
            rateMyWorkBtn.textContent = "Rate My work";
            let ratingFormContainer = document.querySelector('.rating-submission-container');
            ratingFormContainer.style.display = 'none';
            rateMyWorkBtn.style.border="none";
            rateMyWorkBtn.style.backgroundImage="var(--gradient-primary)";
            ratingcheck=true;
        }
    });
    // ============================================
    // Rating Form Submission
    // ============================================

    function setupRatingForm() {
        const form = document.getElementById('ratingSubmissionForm');
        const starInput = document.getElementById('starRatingInput');
        const ratingValue = document.getElementById('ratingValue');
        const description = document.getElementById('ratingDescription');
        const charCount = document.getElementById('charCount');

        if (!form) return;

        // Star rating input
        starInput.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                ratingValue.value = value;
                updateStars(value);
            });

            star.addEventListener('mouseenter', function() {
                const value = this.getAttribute('data-value');
                updateStars(value, true);
            });
        });

        starInput.addEventListener('mouseleave', function() {
            const currentValue = ratingValue.value || 0;
            updateStars(currentValue);
        });

        // Character counter
        if (description && charCount) {
            description.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
        }

        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitRating(form);
        });
    }

    function updateStars(value, isHover = false) {
        const stars = document.querySelectorAll('.star-rating-input .star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.textContent = '★';
                star.classList.add(isHover ? 'hover' : 'selected');
                if (!isHover) star.classList.remove('hover');
            } else {
                star.textContent = '☆';
                star.classList.remove('selected', 'hover');
            }
        });
    }

    async function submitRating(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('ratingFormMessage');

        // Validation
        if (!formData.get('rating')) {
            showMessage('Please select a rating', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Thank you! Your rating has been submitted for review.', 'success');
                form.reset();
                document.getElementById('ratingValue').value = '';
                updateStars(0);
                document.getElementById('charCount').textContent = '0';

                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                throw new Error(result.error || 'Failed to submit rating');
            }

        } catch (error) {
            console.error('Error submitting rating:', error);
            showMessage(error.message || 'Failed to submit rating. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Rating';
        }
    }

    function showMessage(message, type) {
        const messageDiv = document.getElementById('ratingFormMessage');
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

})();

