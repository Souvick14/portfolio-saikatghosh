// ============================================
// Contact Info Dynamic Loader
// ============================================

(function() {
    'use strict';

    async function loadContactInfo() {
        try {
            const response = await fetch('/api/contact');
            
            if (!response.ok) {
                console.error('Failed to load contact info');
                return;
            }

            const contactData = await response.json();
            
            // Update Email
            const emailElement = document.querySelector('.contact-item:nth-child(1) .contact-details p');
            if (emailElement && contactData.email) {
                emailElement.textContent = contactData.email;
            }

            // Update Phone
            const phoneElement = document.querySelector('.contact-item:nth-child(2) .contact-details p');
            if (phoneElement && contactData.phone) {
                phoneElement.textContent = contactData.phone;
            }

            // Update Location
            const locationElement = document.querySelector('.contact-item:nth-child(3) .contact-details p');
            if (locationElement && contactData.location) {
                locationElement.textContent = contactData.location;
            }

            // Update Social Links
            const socialLinks = document.querySelectorAll('.social-link');
            socialLinks.forEach(link => {
                const icon = link.querySelector('i');
                
                if (icon.classList.contains('fa-youtube') && contactData.youtube) {
                    link.href = contactData.youtube;
                } else if (icon.classList.contains('fa-instagram') && contactData.instagram) {
                    link.href = contactData.instagram;
                } else if (icon.classList.contains('fa-twitter') && contactData.twitter) {
                    link.href = contactData.twitter;
                } else if (icon.classList.contains('fa-linkedin') && contactData.linkedin) {
                    link.href = contactData.linkedin;
                }
                
                // Don't show link if URL is empty
                if (!link.href || link.href === '#' || link.href === window.location.href + '#') {
                    link.style.display = 'none';
                } else {
                    link.style.display = '';
                }
            });

            console.log('✅ Contact info loaded successfully');

        } catch (error) {
            console.error('Error loading contact info:', error);
        }
    }

    // Load contact info when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContactInfo);
    } else {
        loadContactInfo();
    }

})();
