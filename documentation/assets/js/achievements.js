// ============================================
// Achievements Section - Instagram-Style Cards
// ============================================

(function() {
    'use strict';

    class AchievementsManager {
        constructor() {
            this.achievements = [];
            this.displayedCount = 8;
            this.increment = 8;
            this.container = document.getElementById('achievementsGrid');
            this.showMoreBtn = document.getElementById('achievementsShowMore');
            this.showLessBtn = document.getElementById('achievementsShowLess');
            
            this.init();
        }

        async init() {
            await this.loadAchievements();
            this.setupEventListeners();
        }

        async loadAchievements() {
            try {
                const response = await fetch('/api/achievements');
                
                if (!response.ok) {
                    throw new Error('Failed to load achievements');
                }

                this.achievements = await response.json();
                this.renderAchievements();
                this.updateButtons();

                console.log(`✅ Loaded ${this.achievements.length} achievements`);

            } catch (error) {
                console.error('Error loading achievements:', error);
                this.showEmptyState();
            }
        }

        renderAchievements() {
            if (!this.container) return;

            // If no achievements, show empty state
            if (this.achievements.length === 0) {
                this.showEmptyState();
                return;
            }

            // Clear existing content
            this.container.innerHTML = '';

            // Render achievements up to displayedCount
            const achievementsToShow = this.achievements.slice(0, this.displayedCount);

            achievementsToShow.forEach(achievement => {
                const card = this.createAchievementCard(achievement);
                this.container.appendChild(card);
            });
        }

        createAchievementCard(achievement) {
            const card = document.createElement('div');
            card.className = 'achievement-card animate-on-scroll';
            card.dataset.achievementId = achievement._id;

            // Admin profile picture or default icon
            const profilePicHTML = achievement.adminProfilePic
                ? `<img src="${achievement.adminProfilePic}" alt="${achievement.adminName}" class="achievement-admin-pic">`
                : `<div class="achievement-admin-pic default-icon"><i class="fas fa-user"></i></div>`;

            card.innerHTML = `
                <div class="achievement-card-header">
                    ${profilePicHTML}
                    <span class="achievement-admin-name">${this.escapeHtml(achievement.adminName || 'Admin')}</span>
                </div>
                <img src="${achievement.achievementImage}" 
                     alt="Achievement" 
                     class="achievement-card-image"
                     loading="lazy">
                <div class="achievement-card-content">
                    <p class="achievement-description">${this.escapeHtml(achievement.description)}</p>
                </div>
            `;

            return card;
        }

        showEmptyState() {
            if (!this.container) return;

            this.container.innerHTML = `
                <div class="achievements-empty">
                    <i class="fas fa-trophy"></i>
                    <p>No achievements yet</p>
                </div>
            `;

            // Hide buttons
            if (this.showMoreBtn) this.showMoreBtn.classList.add('hidden');
            if (this.showLessBtn) this.showLessBtn.classList.add('hidden');
        }

        setupEventListeners() {
            if (this.showMoreBtn) {
                this.showMoreBtn.addEventListener('click', () => {
                    this.showMore();
                });
            }

            if (this.showLessBtn) {
                this.showLessBtn.addEventListener('click', () => {
                    this.showLess();
                });
            }
        }

        showMore() {
            this.displayedCount += this.increment;
            this.renderAchievements();
            this.updateButtons();
            
            // Scroll to first newly revealed card
            const cards = this.container.querySelectorAll('.achievement-card');
            const scrollTarget = cards[this.displayedCount - this.increment];
            if (scrollTarget) {
                scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        showLess() {
            this.displayedCount = this.increment;
            this.renderAchievements();
            this.updateButtons();
            
            // Scroll to section top
            const section = document.getElementById('achievements');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        updateButtons() {
            const hasMore = this.displayedCount < this.achievements.length;
            const canShowLess = this.displayedCount > this.increment;

            if (this.showMoreBtn) {
                this.showMoreBtn.classList.toggle('hidden', !hasMore);
            }

            if (this.showLessBtn) {
                this.showLessBtn.classList.toggle('hidden', !canShowLess);
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new AchievementsManager();
        });
    } else {
        new AchievementsManager();
    }

})();
