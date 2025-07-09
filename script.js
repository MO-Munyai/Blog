// Blog App JavaScript
class BlogApp {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.profile = JSON.parse(localStorage.getItem('blogProfile')) || {
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'Welcome to my blog! I love sharing my thoughts and experiences.',
            website: '',
            avatar: 'https://via.placeholder.com/150'
        };
        this.currentView = 'home';
        this.editingPostId = null;
        
        this.init();
    }

    init() {
        this.loadProfile();
        this.loadPosts();
        this.showHome();
        
        // Add some sample posts if none exist
        if (this.posts.length === 0) {
            this.addSamplePosts();
        }
    }

    addSamplePosts() {
        const samplePosts = [
            {
                id: this.generateId(),
                title: 'Welcome to My Blog',
                content: 'This is my first blog post! I\'m excited to share my thoughts and experiences with you. This blog will cover various topics including technology, lifestyle, and personal growth.',
                category: 'lifestyle',
                tags: ['welcome', 'introduction', 'first-post'],
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date('2024-01-15').toISOString()
            },
            {
                id: this.generateId(),
                title: 'Getting Started with Web Development',
                content: 'Web development is an exciting field that combines creativity with technical skills. In this post, I\'ll share some tips for beginners who want to start their journey in web development. First, learn HTML and CSS basics, then move on to JavaScript.',
                category: 'technology',
                tags: ['web-development', 'programming', 'beginner-tips'],
                createdAt: new Date('2024-01-20').toISOString(),
                updatedAt: new Date('2024-01-20').toISOString()
            },
            {
                id: this.generateId(),
                title: 'My Favorite Travel Destinations',
                content: 'Traveling has always been one of my greatest passions. Over the years, I\'ve been fortunate to visit many amazing places around the world. Here are some of my favorite destinations that I highly recommend.',
                category: 'travel',
                tags: ['travel', 'destinations', 'adventure'],
                createdAt: new Date('2024-01-25').toISOString(),
                updatedAt: new Date('2024-01-25').toISOString()
            }
        ];
        
        this.posts = samplePosts;
        this.savePosts();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Navigation methods
    showHome() {
        this.hideAllViews();
        document.getElementById('home-view').classList.add('active');
        this.currentView = 'home';
        this.loadPosts();
    }

    showProfile() {
        this.hideAllViews();
        document.getElementById('profile-view').classList.add('active');
        this.currentView = 'profile';
        this.loadProfile();
    }

    showCreatePost() {
        this.hideAllViews();
        document.getElementById('post-form-view').classList.add('active');
        this.currentView = 'create-post';
        this.resetPostForm();
        document.getElementById('post-form-title').textContent = 'Create New Post';
    }

    showEditPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        this.hideAllViews();
        document.getElementById('post-form-view').classList.add('active');
        this.currentView = 'edit-post';
        this.editingPostId = postId;
        
        document.getElementById('post-form-title').textContent = 'Edit Post';
        document.getElementById('post-id').value = postId;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-tags').value = post.tags.join(', ');
    }

    showPostDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        this.hideAllViews();
        document.getElementById('post-detail-view').classList.add('active');
        this.currentView = 'post-detail';
        
        const detailContent = document.getElementById('post-detail-content');
        detailContent.innerHTML = `
            <div class="post-detail">
                <div class="post-detail-header">
                    <h1 class="post-detail-title">${this.escapeHtml(post.title)}</h1>
                    <div class="post-detail-meta">
                        <div>
                            <span class="post-category">${post.category}</span>
                            <span class="post-date">${this.formatDate(post.createdAt)}</span>
                        </div>
                        ${post.updatedAt !== post.createdAt ? `<small>Updated: ${this.formatDate(post.updatedAt)}</small>` : ''}
                    </div>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
                <div class="post-detail-content">
                    ${this.escapeHtml(post.content).replace(/\n/g, '<br>')}
                </div>
                <div class="post-detail-actions">
                    <button class="btn btn-secondary" onclick="blogApp.showHome()">Back to Home</button>
                    <button class="btn btn-edit" onclick="blogApp.showEditPost('${post.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="blogApp.confirmDeletePost('${post.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    hideAllViews() {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
    }

    // Profile methods
    loadProfile() {
        document.getElementById('profile-name').value = this.profile.name;
        document.getElementById('profile-email').value = this.profile.email;
        document.getElementById('profile-bio').value = this.profile.bio;
        document.getElementById('profile-website').value = this.profile.website;
        document.getElementById('profile-image').src = this.profile.avatar;
    }

    saveProfile(event) {
        event.preventDefault();
        
        this.profile = {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            bio: document.getElementById('profile-bio').value,
            website: document.getElementById('profile-website').value,
            avatar: this.profile.avatar
        };
        
        localStorage.setItem('blogProfile', JSON.stringify(this.profile));
        this.showSuccessMessage('Profile updated successfully!');
    }

    updateProfileImage() {
        const input = document.getElementById('avatar-input');
        const file = input.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profile.avatar = e.target.result;
                document.getElementById('profile-image').src = this.profile.avatar;
                localStorage.setItem('blogProfile', JSON.stringify(this.profile));
            };
            reader.readAsDataURL(file);
        }
    }

    // Post methods
    loadPosts() {
        const container = document.getElementById('posts-container');
        
        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pen-nib"></i>
                    <h3>No posts yet</h3>
                    <p>Start writing your first blog post!</p>
                    <button class="btn btn-primary" onclick="blogApp.showCreatePost()">Create Post</button>
                </div>
            `;
            return;
        }

        // Sort posts by creation date (newest first)
        const sortedPosts = [...this.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        container.innerHTML = sortedPosts.map(post => `
            <div class="post-card" onclick="blogApp.showPostDetail('${post.id}')">
                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span class="post-category">${post.category}</span>
                    <span class="post-date">${this.formatDate(post.createdAt)}</span>
                </div>
                <p class="post-excerpt">${this.getExcerpt(post.content)}</p>
                <div class="post-tags">
                    ${post.tags.slice(0, 3).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="post-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-edit" onclick="blogApp.showEditPost('${post.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="blogApp.confirmDeletePost('${post.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    savePost(event) {
        event.preventDefault();
        
        const postId = document.getElementById('post-id').value;
        const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value.trim();
        const tagsInput = document.getElementById('post-tags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        if (!title || !category || !content) {
            this.showErrorMessage('Please fill in all required fields.');
            return;
        }

        const now = new Date().toISOString();
        
        if (postId && this.editingPostId) {
            // Update existing post
            const postIndex = this.posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.posts[postIndex] = {
                    ...this.posts[postIndex],
                    title,
                    category,
                    content,
                    tags,
                    updatedAt: now
                };
                this.showSuccessMessage('Post updated successfully!');
            }
        } else {
            // Create new post
            const newPost = {
                id: this.generateId(),
                title,
                category,
                content,
                tags,
                createdAt: now,
                updatedAt: now
            };
            this.posts.unshift(newPost);
            this.showSuccessMessage('Post created successfully!');
        }
        
        this.savePosts();
        this.resetPostForm();
        setTimeout(() => this.showHome(), 1500);
    }

    deletePost(postId) {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.savePosts();
        this.showSuccessMessage('Post deleted successfully!');
        
        if (this.currentView === 'post-detail') {
            setTimeout(() => this.showHome(), 1000);
        } else {
            this.loadPosts();
        }
    }

    confirmDeletePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        this.showModal(
            'Delete Post',
            `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
            () => this.deletePost(postId)
        );
    }

    resetPostForm() {
        document.getElementById('post-form').reset();
        document.getElementById('post-id').value = '';
        this.editingPostId = null;
    }

    searchPosts() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        const container = document.getElementById('posts-container');
        
        if (!query) {
            this.loadPosts();
            return;
        }
        
        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No posts found</h3>
                    <p>Try searching with different keywords.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredPosts.map(post => `
            <div class="post-card" onclick="blogApp.showPostDetail('${post.id}')">
                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span class="post-category">${post.category}</span>
                    <span class="post-date">${this.formatDate(post.createdAt)}</span>
                </div>
                <p class="post-excerpt">${this.getExcerpt(post.content)}</p>
                <div class="post-tags">
                    ${post.tags.slice(0, 3).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="post-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-edit" onclick="blogApp.showEditPost('${post.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="blogApp.confirmDeletePost('${post.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Storage methods
    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getExcerpt(content, maxLength = 150) {
        if (content.length <= maxLength) return this.escapeHtml(content);
        return this.escapeHtml(content.substring(0, maxLength)) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.success-message, .error-message').forEach(el => el.remove());
        
        const messageEl = document.createElement('div');
        messageEl.className = `${type}-message`;
        messageEl.textContent = message;
        
        const container = document.querySelector('.view.active .container');
        if (container) {
            container.insertBefore(messageEl, container.firstChild);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 3000);
        }
    }

    showModal(title, message, onConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal').style.display = 'block';
        
        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.onclick = () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        };
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
}

// Global functions for HTML onclick handlers
function showHome() {
    blogApp.showHome();
}

function showProfile() {
    blogApp.showProfile();
}

function showCreatePost() {
    blogApp.showCreatePost();
}

function saveProfile(event) {
    blogApp.saveProfile(event);
}

function updateProfileImage() {
    blogApp.updateProfileImage();
}

function savePost(event) {
    blogApp.savePost(event);
}

function searchPosts() {
    blogApp.searchPosts();
}

function closeModal() {
    blogApp.closeModal();
}

// Initialize the blog app when the page loads
let blogApp;
document.addEventListener('DOMContentLoaded', () => {
    blogApp = new BlogApp();
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        blogApp.closeModal();
    }
};
