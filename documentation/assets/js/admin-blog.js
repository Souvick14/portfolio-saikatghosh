// ============================================
// Admin Panel - Blog Management
// Extends AdminPanel class
// ============================================

if (typeof AdminPanel !== 'undefined') {
    
    // Quill editor instance
    let quillEditor = null;

    // ==========================
    // Blog Management
    // ==========================
    
    AdminPanel.prototype.loadBlogs = async function() {
        const blogsList = document.getElementById('blogsList');
        
        if (!blogsList) return;
        
        blogsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading blogs...</p>';

        try {
            const response = await fetch('/api/blogs');
            const blogs = await response.json();
            
            blogsList.innerHTML = '';

            if (!blogs || blogs.length === 0) {
                blogsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No blogs added yet. Click "Add New Blog" to get started!</p>';
                return;
            }

            blogs.forEach(blog => {
                const blogElement = this.createBlogElement(blog);
                blogsList.appendChild(blogElement);
            });
        } catch (error) {
            console.error('Error loading blogs:', error);
            blogsList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 3rem;">Failed to load blogs. Please try again.</p>';
        }
    };

    AdminPanel.prototype.createBlogElement = function(blog) {
        const div = document.createElement('div');
        div.className = 'blog-item';
        
        const publishDate = new Date(blog.publishDate).toLocaleDateString();
        const status = blog.published ? '<span style="color: var(--success);">Published</span>' : '<span style="color: var(--warning);">Draft</span>';
        
        div.innerHTML = `
            <div class="blog-item-header">
                <div class="blog-item-cover">
                    <img src="${blog.coverImage}" alt="${blog.title}" 
                         style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;">
                </div>
                <div class="blog-item-info">
                    <h3>${blog.title}</h3>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">
                        <span>${blog.category}</span> • 
                        <span>${publishDate}</span> • 
                        ${status}
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
                        ${blog.excerpt || blog.content.substring(0, 100) + '...'}
                    </p>
                </div>
            </div>
            
            ${blog.tags && blog.tags.length > 0 ? `
                <div style="margin: 1rem 0;">
                    ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                </div>
            ` : ''}
            
            <div class="blog-item-actions">
                <button class="btn-edit" onclick="adminPanel.editBlog('${blog._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="adminPanel.deleteBlog('${blog._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        return div;
    };

    AdminPanel.prototype.openBlogModal = function(blog = null) {
        this.currentBlogId = blog ? blog._id : null;
        const modal = document.getElementById('blogModal');
        const modalTitle = document.getElementById('blogModalTitle');
        const submitBtnText = document.getElementById('submitBlogBtnText');

        // Initialize Quill if not already done
        if (!quillEditor) {
            quillEditor = new Quill('#blogContentEditor', {
                theme: 'snow',
                placeholder: 'Write your blog content here...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });
        }

        if (blog) {
            modalTitle.textContent = 'Edit Blog Post';
            submitBtnText.textContent = 'Update Blog';
            
            document.getElementById('blogTitle').value = blog.title;
            document.getElementById('blogCategory').value = blog.category || 'other';
            document.getElementById('blogAuthor').value = blog.author || 'Admin';
            document.getElementById('blogExcerpt').value = blog.excerpt || '';
            document.getElementById('blogTags').value = blog.tags ? blog.tags.join(', ') : '';
            document.getElementById('blogPublished').checked = blog.published !== false;
            
            // Set Quill content
            quillEditor.root.innerHTML = blog.content;
        } else {
            modalTitle.textContent = 'Add New Blog';
            submitBtnText.textContent = 'Save Blog';
            document.getElementById('blogForm').reset();
            quillEditor.root.innerHTML = '';
        }

        modal.classList.add('active');
    };

    AdminPanel.prototype.closeBlogModal = function() {
        document.getElementById('blogModal').classList.remove('active');
        this.currentBlogId = null;
    };

    AdminPanel.prototype.saveBlog = async function() {
        // Get content from Quill
        const content = quillEditor.root.innerHTML;
        document.getElementById('blogContent').value = content;

        // Create FormData for file upload
        const formData = new FormData();
        
        formData.append('title', document.getElementById('blogTitle').value.trim());
        formData.append('content', content);
        formData.append('excerpt', document.getElementById('blogExcerpt').value.trim());
        formData.append('category', document.getElementById('blogCategory').value);
        formData.append('author', document.getElementById('blogAuthor').value.trim() || 'Admin');
        formData.append('published', document.getElementById('blogPublished').checked);
        
        // Process tags
        const tagsInput = document.getElementById('blogTags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
        formData.append('tags', JSON.stringify(tags));
        
        // Add cover image if selected
        const fileInput = document.getElementById('blogCoverImage');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append('coverImage', fileInput.files[0]);
        }

        // Validation
        if (!formData.get('title') || !content || content === '<p><br></p>') {
            this.showNotification('Please fill in title and content', 'error');
            return;
        }

        try {
            const url = this.currentBlogId ? `/api/blogs/${this.currentBlogId}` : '/api/blogs';
            const method = this.currentBlogId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to save blog');
            }

            this.showNotification(this.currentBlogId ? 'Blog updated successfully!' : 'Blog published successfully!');
            this.closeBlogModal();
            this.loadBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
            this.showNotification('Failed to save blog. Please try again.', 'error');
        }
    };

    AdminPanel.prototype.editBlog = async function(blogId) {
        try {
            const response = await fetch(`/api/blogs/${blogId}`);
            const blog = await response.json();
            if (blog) {
                this.currentBlogId = blogId;
                this.openBlogModal(blog);
            }
        } catch (error) {
            console.error('Error loading blog:', error);
            this.showNotification('Failed to load blog', 'error');
        }
    };

    AdminPanel.prototype.deleteBlog = async function(blogId) {
        if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/blogs/${blogId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete blog');
                }

                this.loadBlogs();
                this.showNotification('Blog deleted successfully!');
            } catch (error) {
                console.error('Error deleting blog:', error);
                this.showNotification('Failed to delete blog', 'error');
            }
        }
    };

    // Event listeners for Blog Management
    AdminPanel.prototype.setupBlogEvents = function() {
        const addBlogBtn = document.getElementById('addBlogBtn');
        if (addBlogBtn) {
            addBlogBtn.addEventListener('click', () => this.openBlogModal());
        }

        const closeBlogModal = document.getElementById('closeBlogModal');
        if (closeBlogModal) {
            closeBlogModal.addEventListener('click', () => this.closeBlogModal());
        }

        const cancelBlogBtn = document.getElementById('cancelBlogBtn');
        if (cancelBlogBtn) {
            cancelBlogBtn.addEventListener('click', () => this.closeBlogModal());
        }

        const blogForm = document.getElementById('blogForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBlog();
            });
        }

        const refreshBlogsBtn = document.getElementById('refreshBlogsBtn');
        if (refreshBlogsBtn) {
            refreshBlogsBtn.addEventListener('click', () => this.loadBlogs());
        }
    };

    // Update switchTab to load blogs
    const originalSwitchTab2 = AdminPanel.prototype.switchTab;
    AdminPanel.prototype.switchTab = function(tab) {
        originalSwitchTab2.call(this, tab);
        
        if (tab === 'blogs') {
            this.loadBlogs();
        }
    };
    
    // Initialize blog events
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.adminPanel) {
                window.adminPanel.setupBlogEvents();
            }
        }, 150);
    });
    
    console.log('✅ Blog management module loaded successfully');
}
