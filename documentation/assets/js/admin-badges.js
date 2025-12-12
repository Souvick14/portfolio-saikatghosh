// ============================================
// Sidebar Badge Counter Updates
// ============================================

(function() {
    'use strict';

    // Update sidebar badges on page load and periodically
    async function updateSidebarBadges() {
        try {
            // Fetch pending ratings count
            const ratingsResponse = await fetch('/api/ratings');
            if (ratingsResponse.ok) {
                const ratings = await ratingsResponse.json();
                const pendingCount = ratings.filter(r => !r.isApproved).length;
                
                const pendingBadge = document.getElementById('navPendingBadge');
                if (pendingBadge) {
                    if (pendingCount > 0) {
                        pendingBadge.textContent = pendingCount;
                        pendingBadge.style.display = 'inline-block';
                    } else {
                        pendingBadge.style.display = 'none';
                    }
                }
            }

            // Fetch unread messages count
            const messagesResponse = await fetch('/api/contact/messages');
            if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                const unreadCount = messages.filter(m => !m.isRead).length;
                
                const unreadBadge = document.getElementById('navUnreadBadge');
                if (unreadBadge) {
                    if (unreadCount > 0) {
                        unreadBadge.textContent = unreadCount;
                        unreadBadge.style.display = 'inline-block';
                    } else {
                        unreadBadge.style.display = 'none';
                    }
                }
            }

        } catch (error) {
            console.error('Error updating sidebar badges:', error);
        }
    }

    // Update on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Initial update after a brief delay to ensure admin panel is loaded
        setTimeout(updateSidebarBadges, 1000);
        
        // Update every 30 seconds
        setInterval(updateSidebarBadges, 30000);
    });

    // Export function so it can be called manually after actions
    window.updateSidebarBadges = updateSidebarBadges;

})();
