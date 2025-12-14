// ============================================
// Admin Panel JavaScript
// Skills Management System
// ============================================

class AdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.currentSkillId = null;
        this.iconList = this.getIconList();
        
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    // ============================================
    // Authentication
    // ============================================
    checkAuth() {
        const authToken = sessionStorage.getItem('adminAuth');
        const authTime = sessionStorage.getItem('adminAuthTime');
        
        if (authToken && authTime) {
            const elapsed = Date.now() - parseInt(authTime);
            if (elapsed < CONFIG.admin.sessionDuration) {
                this.isAuthenticated = true;
                this.showDashboard();
                return;
            }
        }
        
        this.showLogin();
    }

    login(username, password) {
        if (username === CONFIG.admin.username && password === CONFIG.admin.password) {
            sessionStorage.setItem('adminAuth', 'authenticated');
            sessionStorage.setItem('adminAuthTime', Date.now().toString());
            this.isAuthenticated = true;
            this.showDashboard();
            return true;
        }
        return false;
    }

    logout() {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminAuthTime');
        this.isAuthenticated = false;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        this.loadSkills();
    }

    // ============================================
    // Event Listeners
    // ============================================
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (this.login(username, password)) {
                    this.showNotification('Login successful!');
                } else {
                    const errorDiv = document.getElementById('loginError');
                    errorDiv.textContent = 'Invalid username or password';
                    errorDiv.style.display = 'block';
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Tab navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                
                this.switchTab(tab);
            });
        });

        // Skills events
        const addSkillBtn = document.getElementById('addSkillBtn');
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.openSkillModal());
        }

        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => this.resetToDefault());
        }

        // Modal events
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeSkillModal());
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeSkillModal());
        }

        const skillForm = document.getElementById('skillForm');
        if (skillForm) {
            skillForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSkill();
            });
        }

        // Proficiency slider
        const proficiencySlider = document.getElementById('skillProficiency');
        if (proficiencySlider) {
            proficiencySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('proficiencyValue').textContent = value;
                document.getElementById('proficiencyFill').style.width = value + '%';
                this.updatePreview();
            });
        }

        // Icon picker
        const iconPickerBtn = document.getElementById('iconPickerBtn');
        if (iconPickerBtn) {
            iconPickerBtn.addEventListener('click', () => this.openIconPicker());
        }

        const closeIconPicker = document.getElementById('closeIconPicker');
        if (closeIconPicker) {
            closeIconPicker.addEventListener('click', () => this.closeIconPicker());
        }

        const iconSearch = document.getElementById('iconSearch');
        if (iconSearch) {
            iconSearch.addEventListener('input', (e) => {
                this.filterIcons(e.target.value);
            });
        }

        // Add project button
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => this.addProjectInput());
        }

        // Form inputs for live preview
        const formInputs = ['skillName', 'skillCategory', 'skillIcon'];
        formInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
            }
        });
    }

    switchTab(tab) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tab) {
                item.classList.add('active');
            }
        });

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tab + 'Tab').classList.add('active');

        // Update title
        const titles = {
            skills: 'Skills Management',
            reels: 'Long form project Management',
            blogs: 'Blogs Management',
            clientsWork: 'Short form project Management',
            ratings: 'Ratings Management',
            about: 'About Management',
            contact: 'Contact Management',
            contacts: 'Contact Management',
            genres: 'Genre Management',
            instagramreels: 'Instagram Reels Management',
            messages: 'client messages'

        };
        if (tab === 'instagram-reels') {
            tab = 'instagramreels';
        }
        document.getElementById('pageTitle').textContent = titles[tab];
    }

    // ============================================
    // Skills Management
    // ============================================
    async loadSkills() {
        const skillsList = document.getElementById('skillsList');
        
        if (!skillsList) return;
        
        skillsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading skills...</p>';

        try {
            const response = await fetch('/api/skills');
            const skills = await response.json();
            
            skillsList.innerHTML = '';

            if (!skills || skills.length === 0) {
                skillsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No skills added yet. Click "Add New Skill" to get started!</p>';
                return;
            }

            skills.forEach(skill => {
                const skillElement = this.createSkillElement(skill);
                skillsList.appendChild(skillElement);
            });
        } catch (error) {
            console.error('Error loading skills:', error);
            skillsList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 3rem;">Failed to load skills. Please try again.</p>';
        }
    }

    createSkillElement(skill) {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <div class="skill-item-header">
                <div class="skill-item-icon">
                    <i class="${skill.icon}"></i>
                </div>
                <div class="skill-item-info">
                    <h3>${skill.name}</h3>
                    <div class="skill-item-category">${skill.category}</div>
                </div>
            </div>
            
            <div class="skill-item-proficiency">
                <div class="proficiency-bar">
                    <div class="proficiency-bar-fill" style="width: ${skill.proficiency}%"></div>
                </div>
                <div class="proficiency-text">Proficiency: ${skill.proficiency}%</div>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 1rem 0;">
                ${skill.description}
            </p>
            
            <div style="color: var(--text-muted); font-size: 0.875rem;">
                ${skill.projects.length} project(s) listed
            </div>
            
            <div class="skill-item-actions">
                <button class="btn-edit" onclick="adminPanel.editSkill('${skill._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="adminPanel.deleteSkill('${skill._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        return div;
    }

    openSkillModal(skill = null) {
        this.currentSkillId = skill ? skill._id : null;
        const modal = document.getElementById('skillModal');
        const modalTitle = document.getElementById('modalTitle');
        const submitBtnText = document.getElementById('submitBtnText');
        
        if (skill) {
            modalTitle.textContent = 'Edit Skill';
            submitBtnText.textContent = 'Update Skill';
            this.fillSkillForm(skill);
        } else {
            modalTitle.textContent = 'Add New Skill';
            submitBtnText.textContent = 'Save Skill';
            document.getElementById('skillForm').reset();
            this.resetProjectInputs();
            document.getElementById('proficiencyValue').textContent = '0';
            document.getElementById('proficiencyFill').style.width = '0%';
        }
        
        modal.classList.add('active');
        this.updatePreview();
    }

    closeSkillModal() {
        document.getElementById('skillModal').classList.remove('active');
        this.currentSkillId = null;
    }

    fillSkillForm(skill) {
        document.getElementById('skillId').value = skill._id;
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillCategory').value = skill.category;
        document.getElementById('skillIcon').value = skill.icon;
        document.getElementById('skillProficiency').value = skill.proficiency;
        document.getElementById('skillDescription').value = skill.description;
        
        document.getElementById('proficiencyValue').textContent = skill.proficiency;
        document.getElementById('proficiencyFill').style.width = skill.proficiency + '%';
        
        // Icon preview
        const iconPreview = document.getElementById('iconPreview');
        iconPreview.innerHTML = `<i class="${skill.icon}"></i>`;
        
        // Projects
        this.resetProjectInputs();
        skill.projects.forEach((project, index) => {
            if (index === 0) {
                document.querySelector('.project-input').value = project;
            } else {
                this.addProjectInput(project);
            }
        });
    }

    resetProjectInputs() {
        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = `
            <div class="project-input-group">
                <input type="text" class="project-input" placeholder="Project description or achievement">
                <button type="button" class="btn-icon btn-remove-project" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    addProjectInput(value = '') {
        const projectsList = document.getElementById('projectsList');
        const newGroup = document.createElement('div');
        newGroup.className = 'project-input-group';
        newGroup.innerHTML = `
            <input type="text" class="project-input" placeholder="Project description or achievement" value="${value}">
            <button type="button" class="btn-icon btn-remove-project">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const removeBtn = newGroup.querySelector('.btn-remove-project');
        removeBtn.addEventListener('click', () => {
            newGroup.remove();
        });
        
        projectsList.appendChild(newGroup);
    }

    async saveSkill() {
        // Create FormData for file upload
        const formData = new FormData();

        // Add text fields
        formData.append('name', document.getElementById('skillName').value.trim());
        formData.append('category', document.getElementById('skillCategory').value.trim());
        formData.append('icon', document.getElementById('skillIcon').value.trim());
        formData.append('proficiency', document.getElementById('skillProficiency').value);
        formData.append('description', document.getElementById('skillDescription').value.trim());
        
        // Collect projects
        const projects = [];
        const projectInputs = document.querySelectorAll('.project-input');
        projectInputs.forEach(input => {
            if (input.value.trim()) {
                projects.push(input.value.trim());
            }
        });
        
        // Add projects as JSON string
        formData.append('projects', JSON.stringify(projects));
        
        // Add background image file if selected
        const fileInput = document.getElementById('skillBackgroundImage');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append('backgroundImage', fileInput.files[0]);
        }

        // Validate
        if (!formData.get('name') || !formData.get('category') || !formData.get('icon') || !formData.get('description')) {
            this.showNotification('Please fill in  required fields', 'error');
            return;
        }

        if (projects.length === 0) {
            this.showNotification('Please add at least one project', 'error');
            return;
        }

        try {
            // Save or update
            const url = this.currentSkillId ? `/api/skills/${this.currentSkillId}` : '/api/skills';
            const method = this.currentSkillId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formData
                // Don't set Content-Type header - browser will set it with boundary
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
    }

    async editSkill(skillId) {
        try {
            const response = await fetch(`/api/skills/${skillId}`);
            const skill = await response.json();
            if (skill) {
                this.currentSkillId = skillId;
                this.openSkillModal(skill);
            }
        } catch (error) {
            console.error('Error loading skill:', error);
            this.showNotification('Failed to load skill', 'error');
        }
    }

    async deleteSkill(skillId) {
        if (confirm('Are you sure you want to delete this skill?')) {
            try {
                const response = await fetch(`/api/skills/${skillId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete skill');
                }

                this.loadSkills();
                this.showNotification('Skill deleted successfully!');
            } catch (error) {
                console.error('Error deleting skill:', error);
                this.showNotification('Failed to delete skill',  'error');
            }
        }
    }

    resetToDefault() {
        if (confirm('This will reset all skills to default data. Are you sure?')) {
            dataManager.resetToMock();
            this.loadSkills();
            this.showNotification('Data reset to default!');
        }
    }

    // ============================================
    // Icon Picker
    // ============================================
    openIconPicker() {
        const modal = document.getElementById('iconPickerModal');
        modal.classList.add('active');
        this.renderIcons();
    }

    closeIconPicker() {
        document.getElementById('iconPickerModal').classList.remove('active');
    }

    renderIcons(filter = '') {
        const grid = document.getElementById('iconPickerGrid');
        grid.innerHTML = '';

        const icons = filter 
            ? this.iconList.filter(icon => icon.includes(filter.toLowerCase()))
            : this.iconList;

        icons.forEach(icon => {
            const div = document.createElement('div');
            div.className = 'icon-picker-item';
            div.innerHTML = `<i class="${icon}"></i>`;
            div.title = icon;
            
            div.addEventListener('click', () => {
                document.getElementById('skillIcon').value = icon;
                const iconPreview = document.getElementById('iconPreview');
                iconPreview.innerHTML = `<i class="${icon}"></i>`;
                this.closeIconPicker();
                this.updatePreview();
            });
            
            grid.appendChild(div);
        });
    }

    filterIcons(query) {
        this.renderIcons(query);
    }

    getIconList() {
        // Common Font Awesome icons for skills
        return [
            'fas fa-film', 'fas fa-video', 'fas fa-layer-group', 'fas fa-image',
            'fas fa-palette', 'fas fa-paint-brush', 'fas fa-music', 'fas fa-headphones',
            'fas fa-cube', 'fas fa-cubes', 'fas fa-pencil-alt', 'fas fa-pen-nib',
            'fas fa-camera', 'fas fa-camera-retro', 'fas fa-play-circle', 'fas fa-cut',
            'fas fa-magic', 'fas fa-wand-magic-sparkles', 'fas fa-star', 'fas fa-bolt',
            'fas fa-lightbulb', 'fas fa-code', 'fas fa-laptop-code', 'fas fa-desktop',
            'fas fa-mobile-alt', 'fas fa-tablet-alt', 'fas fa-tv', 'fas fa-sliders-h',
            'fas fa-tools', 'fas fa-cog', 'fas fa-cogs', 'fas fa-wrench',
            'fas fa-screwdriver', 'fas fa-hammer', 'fas fa-ruler', 'fas fa-drafting-compass',
            'fas fa-pen-fancy', 'fas fa-marker', 'fas fa-highlighter', 'fas fa-brush',
            'fas fa-fill-drip', 'fas fa-eye-dropper', 'fas fa-adjust', 'fas fa-tint',
            'fas fa-chart-line', 'fas fa-chart-bar', 'fas fa-chart-pie', 'fas fa-microphone',
            'fas fa-broadcast-tower', 'fas fa-podcast', 'fas fa-rss', 'fas fa-wifi'
        ];
    }

    // ============================================
    // Live Preview
    // ============================================
    updatePreview() {
        const name = document.getElementById('skillName').value || 'Skill Name';
        const category = document.getElementById('skillCategory').value || 'Category';
        const icon = document.getElementById('skillIcon').value || 'fas fa-film';
        const proficiency = document.getElementById('skillProficiency').value || 0;

        const preview = document.getElementById('skillPreview');
        preview.innerHTML = `
            <div class="preview-front">
                <div class="preview-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="preview-category">${category}</div>
                <h3 class="preview-name">${name}</h3>
                <div class="preview-proficiency">${proficiency}%</div>
            </div>
        `;
    }

    // ============================================
    // Notifications
    // ============================================
    showNotification(message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const messageSpan = document.getElementById('notificationMessage');
        
        messageSpan.textContent = message;
        
        if (type === 'error') {
            toast.style.borderColor = 'var(--error)';
            toast.querySelector('i').style.color = 'var(--error)';
        } else {
            toast.style.borderColor = 'var(--success)';
            toast.querySelector('i').style.color = 'var(--success)';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize admin panel
let adminPanel;
window.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
