// ============================================
// Messages Admin Management
// ============================================

(function() {
    'use strict';

    let isSetup = false;

    document.addEventListener('DOMContentLoaded', function() {
        setupMessagesAdmin();
        
        // Load messages when tab is clicked
        const messagesTab = document.querySelector('[data-tab="messages"]');
        if (messagesTab) {
            messagesTab.addEventListener('click', () => {
                setTimeout(() => {
                    if (window.adminPanel && window.adminPanel.loadMessages) {
                        window.adminPanel.loadMessages();
                    }
                }, 50);
            });
        }
    });

    function setupMessagesAdmin() {
        if (isSetup) {
            console.log('⏭️ Messages admin already set up');
            return;
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshMessagesBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (window.adminPanel && window.adminPanel.loadMessages) {
                    window.adminPanel.loadMessages();
                }
            });
        }

        isSetup = true;
        console.log('✅ Messages admin setup complete');
    }

})();

// Add messages management to AdminPanel prototype
if (typeof AdminPanel !== 'undefined') {
    
    // Load all messages
    AdminPanel.prototype.loadMessages = async function() {
        try {
            const response = await fetch('/api/contact/messages');
            if (!response.ok) throw new Error('Failed to load messages');
            
            const messages = await response.json();
            
            // Separate unread and read
            const unread = messages.filter(m => !m.isRead);
            const read = messages.filter(m => m.isRead);
            
            // Update counts
            document.getElementById('unreadCount').textContent = unread.length;
            document.getElementById('readCount').textContent = read.length;
            
            // Render lists
            renderMessagesList('unreadMessagesList', unread, false);
           renderMessagesList('readMessagesList', read, true);
            
            console.log(`✅ Loaded ${messages.length} messages (${unread.length} unread, ${read.length} read)`);
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showNotification('Failed to load messages', 'error');
        }
    };

    // Render messages list
    function renderMessagesList(containerId, messages, isRead) {
        const container = document.getElementById(containerId);
        
        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="empty-placeholder">
                    <i class="fas fa-${isRead ? 'check' : 'inbox'}"></i>
                    <p>No ${isRead ? 'read' : 'unread'} messages</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        messages.forEach(message => {
            const card = createMessageAdminCard(message, isRead);
            container.appendChild(card);
        });
    }

    function createMessageAdminCard(message, isRead) {
        const div = document.createElement('div');
        div.className = 'message-admin-card';
        
        const date = new Date(message.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        div.innerHTML = `
            <div class="message-admin-header">
                <div class="message-admin-info">
                    <h4>${message.name}</h4>
                    <a href="mailto:${message.email}" class="message-email-link">
                        <i class="fas fa-envelope"></i> ${message.email}
                    </a>
                    <small>${date}</small>
                </div>
            </div>
            <div class="message-admin-subject">
                <strong>Subject:</strong> ${message.subject}
            </div>
            <p class="message-admin-text">${message.message}</p>
            <div class="message-admin-actions">
                ${!isRead ? `
                    <button class="btn-small btn-primary" onclick="window.adminPanel.markMessageRead('${message._id}')">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>
                ` : `
                    <button class="btn-small btn-secondary" onclick="window.adminPanel.markMessageUnread('${message._id}')">
                        <i class="fas fa-undo"></i> Mark as Unread
                    </button>
                `}
                <button class="btn-small btn-delete" onclick="window.adminPanel.deleteMessage('${message._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return div;
    }

    // Mark message as read
    AdminPanel.prototype.markMessageRead = async function(messageId) {
        try {
            const response = await fetch(`/api/contact/messages/${messageId}/read`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.showNotification('Message marked as read!', 'success');
                this.loadMessages();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
            this.showNotification('Failed to update message', 'error');
        }
    };

    // Mark message as unread
    AdminPanel.prototype.markMessageUnread = async function(messageId) {
        try {
            const response = await fetch(`/api/contact/messages/${messageId}/read`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.showNotification('Message marked as unread!', 'success');
                this.loadMessages();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Error marking message as unread:', error);
            this.showNotification('Failed to update message', 'error');
        }
    };

    // Delete message
    AdminPanel.prototype.deleteMessage = async function(messageId) {
        if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/contact/messages/${messageId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Message deleted!', 'success');
                this.loadMessages();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            this.showNotification('Failed to delete message', 'error');
        }
    };
}
