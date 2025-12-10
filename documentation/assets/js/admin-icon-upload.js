// ============================================
// Icon Upload Handler for Skills
// Extends AdminPanel with icon image upload functionality
// ============================================

if (typeof AdminPanel !== 'undefined') {
    
    // Add event listeners for icon type toggle
    AdminPanel.prototype.setupIconTypeToggle = function() {
        const iconTypeRadios = document.querySelectorAll('input[name="iconType"]');
        
        iconTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const uploadSection = document.getElementById('iconUploadSection');
                const faSection = document.getElementById('iconFontAwesomeSection');
                
                if (e.target.value === 'upload') {
                    uploadSection.style.display = 'block';
                    faSection.style.display = 'none';
                } else {
                    uploadSection.style.display = 'none';
                    faSection.style.display = 'block';
                }
            });
        });

        // Icon image file input preview
        const iconImageInput = document.getElementById('skillIconImage');
        if (iconImageInput) {
            iconImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const preview = document.getElementById('iconImagePreview');
                        const container = document.getElementById('iconImagePreviewContainer');
                        preview.src = event.target.result;
                        container.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Remove icon image
        const removeIconImageBtn = document.getElementById('removeIconImageBtn');
        if (removeIconImageBtn) {
            removeIconImageBtn.addEventListener('click', () => {
                document.getElementById('skillIconImage').value = '';
                document.getElementById('iconImagePreviewContainer').style.display = 'none';
            });
        }
    };

    // Update saveSkill to handle icon image
    const originalSaveSkill = AdminPanel.prototype.saveSkill;
    AdminPanel.prototype.saveSkill = async function() {
        const formData = new FormData();

        // Add text fields
        formData.append('name', document.getElementById('skillName').value.trim());
        formData.append('category', document.getElementById('skillCategory').value.trim());
        formData.append('proficiency', document.getElementById('skillProficiency').value);
        formData.append('description', document.getElementById('skillDescription').value.trim());
        
        // Check which icon type is selected
        const iconType = document.querySelector('input[name="iconType"]:checked').value;
        
        if (iconType === 'fontawesome') {
            // Use Font Awesome icon
            const icon = document.getElementById('skillIcon').value.trim();
            if (icon) {
                formData.append('icon', icon);
            }
        } else {
            // Use uploaded icon image
            const iconImageInput = document.getElementById('skillIconImage');
            if (iconImageInput && iconImageInput.files && iconImageInput.files[0]) {
                formData.append('iconImage', iconImageInput.files[0]);
            }
            // Still send a default icon for fallback
            formData.append('icon', 'fas fa-image');
        }
        
        // Collect projects
        const projects = [];
        const projectInputs = document.querySelectorAll('.project-input');
        projectInputs.forEach(input => {
            if (input.value.trim()) {
                projects.push(input.value.trim());
            }
        });
        
        formData.append('projects', JSON.stringify(projects));
        
        // Add background image file if selected
        const fileInput = document.getElementById('skillBackgroundImage');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append('backgroundImage', fileInput.files[0]);
        }

        // Validate
        if (!formData.get('name') || !formData.get('category') || !formData.get('description')) {
            this.showNotification('Please fill in required fields', 'error');
            return;
        }

        if (projects.length === 0) {
            this.showNotification('Please add at least one project', 'error');
            return;
        }

        try {
            const url = this.currentSkillId ? `/api/skills/${this.currentSkillId}` : '/api/skills';
            const method = this.currentSkillId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to save skill');
            }

            this.showNotification(this.currentSkillId ? 'Skill updated successfully!' : 'Skill added successfully!');
            this.closeSkillModal();
            this.loadSkills();
        } catch (error) {
            console.error('Error saving skill:', error);
            this.showNotification('Failed to save skill. Please try again.', 'error');
        }
    };

    // Initialize icon toggle events
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.adminPanel) {
                adminPanel.setupIconTypeToggle();
            }
        }, 200);
    });

    console.log('✅ Icon upload handler loaded successfully');
}
