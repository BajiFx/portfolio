// ============================================
// ADMIN.JS - Complete Admin Panel (Backend API Version)
// ============================================

console.log('✅ admin.js loaded (API version)');

// ============================================
// CONFIGURATION
// ============================================

const API_BASE = 'https://portfolio-cms-gqrm.onrender.com';
// For local development, use: const API_BASE = 'http://localhost:3000';

let portfolioData = {};
let imageCounter = 0;
let videoCounter = 0;

// ============================================
// CHECK LOGIN
// ============================================

if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// ============================================
// INITIALIZE
// ============================================

async function initAdmin() {
    await loadData();
    setupTabs();
    setupSidebarButtons();
    updateDashboard();
    renderAll();
    setupDynamicUploads();
}

// ============================================
// LOAD DATA FROM BACKEND
// ============================================

async function loadData() {
    try {
        const response = await fetch(`${API_BASE}/api/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        portfolioData = await response.json();
        
        // Ensure all arrays exist
        if (!portfolioData.projectGroups) portfolioData.projectGroups = [];
        if (!portfolioData.experience) portfolioData.experience = [];
        if (!portfolioData.education) portfolioData.education = [];
        if (!portfolioData.certifications) portfolioData.certifications = [];
        if (!portfolioData.skills) portfolioData.skills = [];
        if (!portfolioData.social) portfolioData.social = {};
        if (!portfolioData.videos) portfolioData.videos = {};
        if (!portfolioData.personal) portfolioData.personal = {};
        if (!portfolioData.about) portfolioData.about = { paragraphs: [] };
        
        console.log('✅ Data loaded from backend');
        renderAll();
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load portfolio data. Please check your internet connection.');
        resetDefaultData();
    }
}

function resetDefaultData() {
    portfolioData = {
        personal: {
            name: 'Your Name',
            title: 'Web Designer & Developer',
            badge: '🚀 Available for Freelance Work',
            heroSubtitle: 'Building exceptional digital experiences.',
            welcomeMessage: 'Welcome to my portfolio!',
            email: 'your.email@gmail.com'
        },
        about: { paragraphs: ['I\'m a passionate developer...'] },
        skills: [],
        projectGroups: [],
        experience: [],
        education: [],
        certifications: [],
        social: {},
        videos: {},
        footer: '© 2025 Your Name. Built with ❤️'
    };
    saveData();
}

// ============================================
// SAVE DATA TO BACKEND
// ============================================

async function saveData() {
    try {
        // Save profile
        const profileResponse = await fetch(`${API_BASE}/api/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: portfolioData.personal?.name || '',
                title: portfolioData.personal?.title || '',
                badge: portfolioData.personal?.badge || '',
                heroSubtitle: portfolioData.personal?.heroSubtitle || '',
                welcomeMessage: portfolioData.personal?.welcomeMessage || '',
                email: portfolioData.personal?.email || '',
                profileImage: portfolioData.personal?.profileImage || '',
                aboutImage: portfolioData.personal?.aboutImage || '',
                resume: portfolioData.personal?.resume || '',
                footer: portfolioData.footer || ''
            })
        });
        
        // Save about paragraphs
        await fetch(`${API_BASE}/api/about`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paragraphs: portfolioData.about?.paragraphs || [] })
        });
        
        // Save skills
        await fetch(`${API_BASE}/api/skills`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: portfolioData.skills || [] })
        });
        
        // Save welcome video
        await fetch(`${API_BASE}/api/welcome-video`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: portfolioData.videos?.welcome || '' })
        });
        
        // Note: Groups, Projects, Experience, Education, Certifications, Social
        // are saved individually through their own endpoints
        
        updateDashboard();
        console.log('✅ Data saved to backend');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Failed to save data. Please check your internet connection.');
    }
}

// ============================================
// RENDER ALL SECTIONS
// ============================================

function renderAll() {
    renderProfileForm();
    renderGroupsList();
    renderExperienceList();
    renderEducationList();
    renderCertificationsList();
    renderSocialList();
    renderMessages();
    renderResumePreview();
    renderWelcomeVideoPreview();
    updateGroupSelect();
    updateDashboard();
}

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
    const groups = portfolioData.projectGroups || [];
    const projects = groups.reduce((sum, g) => sum + (g.projects?.length || 0), 0);
    document.getElementById('statGroups').textContent = groups.length;
    document.getElementById('statProjects').textContent = projects;
    document.getElementById('statExperience').textContent = portfolioData.experience?.length || 0;
    document.getElementById('statEducation').textContent = portfolioData.education?.length || 0;
    document.getElementById('statCertifications').textContent = portfolioData.certifications?.length || 0;
    loadMessages(); // Load messages from backend
}

// ============================================
// TABS
// ============================================

function setupTabs() {
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-btn').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');
    const btn = document.querySelector(`.sidebar-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    if (tabId === 'projects') renderGroupsList();
    if (tabId === 'experience') renderExperienceList();
    if (tabId === 'education') renderEducationList();
    if (tabId === 'certifications') renderCertificationsList();
    if (tabId === 'social') renderSocialList();
    if (tabId === 'messages') renderMessages();
    if (tabId === 'profile') renderProfileForm();
}

function setupSidebarButtons() {}

// ============================================
// PROFILE
// ============================================

function renderProfileForm() {
    const p = portfolioData.personal || {};
    document.getElementById('profileName').value = p.name || '';
    document.getElementById('profileTitle').value = p.title || '';
    document.getElementById('profileBadge').value = p.badge || '';
    document.getElementById('profileSubtitle').value = p.heroSubtitle || '';
    document.getElementById('welcomeMessage').value = p.welcomeMessage || '';
    document.getElementById('profileEmail').value = p.email || '';
    const bio = portfolioData.about?.paragraphs?.join('\n\n') || '';
    document.getElementById('profileBio').value = bio;
    if (p.profileImage) {
        document.getElementById('profilePicturePreview').innerHTML = `<img src="${p.profileImage}" style="width:150px;height:150px;border-radius:50%;object-fit:cover;">`;
    }
    if (p.aboutImage) {
        document.getElementById('aboutImagePreview').innerHTML = `<img src="${p.aboutImage}" style="max-width:200px;max-height:150px;object-fit:cover;border-radius:12px;">`;
    }
}

document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const p = portfolioData.personal || {};
    p.name = document.getElementById('profileName').value.trim();
    p.title = document.getElementById('profileTitle').value.trim();
    p.badge = document.getElementById('profileBadge').value.trim();
    p.heroSubtitle = document.getElementById('profileSubtitle').value.trim();
    p.welcomeMessage = document.getElementById('welcomeMessage').value.trim();
    p.email = document.getElementById('profileEmail').value.trim();
    portfolioData.personal = p;
    const bioText = document.getElementById('profileBio').value.trim();
    portfolioData.about = {
        paragraphs: bioText ? bioText.split('\n\n').filter(p => p.trim()) : []
    };
    await saveData();
    alert('✅ Profile saved!');
    renderProfileForm();
    updateDashboard();
});

// **********************************************
// UPDATED: Profile Picture upload to Cloudinary
// **********************************************
document.getElementById('profilePicture').addEventListener('change', async function(e) {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // using 'image' key as expected by your /api/upload endpoint

    try {
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success && result.url) {
            // Update preview
            const img = document.createElement('img');
            img.src = result.url;
            img.style.cssText = 'width:150px;height:150px;border-radius:50%;object-fit:cover;';
            const previewContainer = document.getElementById('profilePicturePreview');
            previewContainer.innerHTML = '';
            previewContainer.appendChild(img);

            // Save URL to data and persist
            portfolioData.personal.profileImage = result.url;
            await saveData();
            alert('✅ Profile picture uploaded to Cloudinary!');
        } else {
            alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading to Cloudinary.');
    }
});

// **********************************************
// UPDATED: About Image upload to Cloudinary
// **********************************************
document.getElementById('aboutImage').addEventListener('change', async function(e) {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success && result.url) {
            const img = document.createElement('img');
            img.src = result.url;
            img.style.cssText = 'max-width:200px;max-height:150px;object-fit:cover;border-radius:12px;';
            const previewContainer = document.getElementById('aboutImagePreview');
            previewContainer.innerHTML = '';
            previewContainer.appendChild(img);

            portfolioData.personal.aboutImage = result.url;
            await saveData();
            alert('✅ About image uploaded to Cloudinary!');
        } else {
            alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading to Cloudinary.');
    }
});

// ============================================
// PROJECT GROUPS & PROJECTS
// ============================================

function renderGroupsList() {
    const container = document.getElementById('groupsList');
    const groups = portfolioData.projectGroups || [];
    if (groups.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No groups created yet.</p>`;
        return;
    }
    container.innerHTML = groups.map((group, gIndex) => {
        const groupId = group.id || group._id || gIndex;
        return `
        <div style="background:var(--bg-card);padding:1.5rem;border-radius:16px;border:1px solid var(--border-color);margin-bottom:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <div>
                    <h3><i class="${group.icon || 'fas fa-folder'}"></i> ${group.name}</h3>
                    <p style="color:var(--text-secondary);font-size:0.9rem;">${group.description || ''}</p>
                </div>
                <div style="display:flex;gap:0.5rem;">
                    <button onclick="editGroup('${groupId}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteGroup('${groupId}')" class="btn-delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                <h4 style="margin-bottom:0.5rem;">Projects (${group.projects?.length || 0})</h4>
                <div style="display:grid;gap:0.8rem;">
                    ${(group.projects || []).map((project, pIndex) => {
                        const projectId = project.id || project._id || pIndex;
                        return `
                        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-primary);padding:0.8rem 1rem;border-radius:8px;border:1px solid var(--border-color);">
                            <div>
                                <strong>${project.title}</strong>
                                <span style="color:var(--text-light);font-size:0.8rem;margin-left:0.5rem;">
                                    ${project.technologies ? project.technologies.join(', ') : ''}
                                </span>
                            </div>
                            <div style="display:flex;gap:0.5rem;">
                                <button onclick="editProject('${groupId}', '${projectId}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteProject('${groupId}', '${projectId}')" class="btn-delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
                <button onclick="showAddProject('${groupId}')" class="btn secondary" style="margin-top:1rem;padding:0.4rem 1rem;font-size:0.85rem;">
                    <i class="fas fa-plus"></i> Add Project
                </button>
            </div>
        </div>
    `}).join('');
}

// ===== GROUP CRUD =====

function showAddGroup() {
    document.getElementById('addGroupForm').style.display = 'block';
    document.getElementById('groupFormTitle').textContent = '📂 Create New Project Group';
    document.getElementById('groupSubmitBtn').textContent = 'Create Group';
    document.getElementById('groupEditId').value = '';
    document.getElementById('groupName').value = '';
    document.getElementById('groupIcon').value = 'fas fa-folder';
    document.getElementById('groupDescription').value = '';
    document.getElementById('addGroupForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddGroup() {
    document.getElementById('addGroupForm').style.display = 'none';
}

async function editGroup(groupId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;
    document.getElementById('addGroupForm').style.display = 'block';
    document.getElementById('groupFormTitle').textContent = '✏️ Edit Project Group';
    document.getElementById('groupSubmitBtn').textContent = 'Update Group';
    document.getElementById('groupEditId').value = groupId;
    document.getElementById('groupName').value = group.name;
    document.getElementById('groupIcon').value = group.icon || 'fas fa-folder';
    document.getElementById('groupDescription').value = group.description || '';
    document.getElementById('addGroupForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteGroup(groupId) {
    if (!confirm('Delete this group and all its projects?')) return;
    try {
        await fetch(`${API_BASE}/api/groups/${groupId}`, { method: 'DELETE' });
        await loadData();
        renderGroupsList();
        updateDashboard();
        alert('✅ Group deleted!');
    } catch (error) {
        alert('❌ Failed to delete group: ' + error.message);
    }
}

document.getElementById('groupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const editId = document.getElementById('groupEditId').value;
    const name = document.getElementById('groupName').value.trim();
    const icon = document.getElementById('groupIcon').value.trim() || 'fas fa-folder';
    const description = document.getElementById('groupDescription').value.trim();
    
    try {
        if (editId) {
            await fetch(`${API_BASE}/api/groups/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon, description })
            });
        } else {
            await fetch(`${API_BASE}/api/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon, description })
            });
        }
        await loadData();
        hideAddGroup();
        renderGroupsList();
        updateDashboard();
        alert('✅ Group saved!');
    } catch (error) {
        alert('❌ Failed to save group: ' + error.message);
    }
});

// ============================================
// PROJECT CRUD WITH DYNAMIC UPLOADS
// ============================================

function showAddProject(groupId) {
    if (groupId) {
        document.getElementById('projectGroupSelect').value = groupId;
        document.getElementById('selectedGroupDisplay').style.display = 'flex';
        const group = portfolioData.projectGroups.find(g => g.id == groupId);
        document.getElementById('selectedGroupName').textContent = group ? group.name : '';
        document.getElementById('projectGroupId').value = groupId;
    } else {
        document.getElementById('selectedGroupDisplay').style.display = 'none';
        document.getElementById('projectGroupId').value = '';
    }
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = '📄 Add New Project';
    document.getElementById('projectSubmitBtn').textContent = 'Save Project';
    document.getElementById('projectEditId').value = '';
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectGithub').value = '';
    document.getElementById('projectDemo').value = '';
    document.getElementById('projectReadme').value = '';
    document.getElementById('imageUploadContainer').innerHTML = '';
    document.getElementById('videoUploadContainer').innerHTML = '';
    document.getElementById('projectFilesPreview').innerHTML = '';
    imageCounter = 0;
    videoCounter = 0;
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
    updateGroupSelect();
}

function hideAddProject() {
    document.getElementById('addProjectForm').style.display = 'none';
}

async function editProject(groupId, projectId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;
    const project = group.projects.find(p => p.id == projectId);
    if (!project) return;
    
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = '✏️ Edit Project';
    document.getElementById('projectSubmitBtn').textContent = 'Update Project';
    document.getElementById('projectEditId').value = projectId;
    document.getElementById('projectGroupId').value = groupId;
    document.getElementById('projectGroupSelect').value = groupId;
    document.getElementById('selectedGroupDisplay').style.display = 'flex';
    document.getElementById('selectedGroupName').textContent = group.name;
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectTech').value = (project.technologies || []).join(', ');
    document.getElementById('projectGithub').value = project.github || '';
    document.getElementById('projectDemo').value = project.demo || '';
    document.getElementById('projectReadme').value = project.readme || '';
    
    document.getElementById('imageUploadContainer').innerHTML = '';
    document.getElementById('videoUploadContainer').innerHTML = '';
    imageCounter = 0;
    videoCounter = 0;
    
    const images = project.images || [];
    images.forEach(url => addImagePreview(url));
    
    const videos = project.videos || [];
    videos.forEach(url => addVideoPreview(url));
    
    const filesPreview = document.getElementById('projectFilesPreview');
    filesPreview.innerHTML = '';
    (project.files || []).forEach(f => {
        filesPreview.innerHTML += `<span style="display:inline-block;background:var(--bg-primary);padding:0.3rem 0.8rem;border-radius:50px;font-size:0.8rem;border:1px solid var(--border-color);">📎 ${f.name}</span>`;
    });
    
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
    updateGroupSelect();
}

async function deleteProject(groupId, projectId) {
    if (!confirm('Delete this project?')) return;
    try {
        await fetch(`${API_BASE}/api/projects/${projectId}`, { method: 'DELETE' });
        await loadData();
        renderGroupsList();
        updateDashboard();
        alert('✅ Project deleted!');
    } catch (error) {
        alert('❌ Failed to delete project: ' + error.message);
    }
}

function updateGroupSelect() {
    const select = document.getElementById('projectGroupSelect');
    const groups = portfolioData.projectGroups || [];
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Select a group --</option>';
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        select.appendChild(opt);
    });
    if (currentVal) select.value = currentVal;
}

document.getElementById('projectGroupSelect').addEventListener('change', function() {
    const groupId = this.value;
    if (groupId) {
        document.getElementById('projectGroupId').value = groupId;
        document.getElementById('selectedGroupDisplay').style.display = 'flex';
        const group = portfolioData.projectGroups.find(g => g.id == groupId);
        document.getElementById('selectedGroupName').textContent = group ? group.name : '';
    } else {
        document.getElementById('projectGroupId').value = '';
        document.getElementById('selectedGroupDisplay').style.display = 'none';
    }
});

// ============================================
// DYNAMIC UPLOAD SETUP
// ============================================

function setupDynamicUploads() {
    document.getElementById('addImageBtn').addEventListener('click', function() {
        addImageUploadRow();
    });
    document.getElementById('addVideoBtn').addEventListener('click', function() {
        addVideoUploadRow();
    });
}

function addImageUploadRow() {
    const container = document.getElementById('imageUploadContainer');
    const rowId = 'img-row-' + (++imageCounter);
    const row = document.createElement('div');
    row.id = rowId;
    row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;';
    row.innerHTML = `
        <input type="file" accept="image/*" style="flex:1;min-width:150px;padding:0.3rem;">
        <button type="button" class="btn-upload-image" style="background:#22c55e;color:white;border:none;padding:0.3rem 0.8rem;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-cloud-upload-alt"></i> Upload
        </button>
        <button type="button" class="btn-remove-row" style="background:#ef4444;color:white;border:none;padding:0.3rem 0.8rem;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-times"></i>
        </button>
        <div class="upload-preview" style="display:inline-block;margin-left:0.3rem;"></div>
    `;
    container.appendChild(row);
    
    const uploadBtn = row.querySelector('.btn-upload-image');
    const fileInput = row.querySelector('input[type="file"]');
    const previewDiv = row.querySelector('.upload-preview');
    
    uploadBtn.addEventListener('click', async function() {
        await uploadFile(fileInput, previewDiv, 'image');
    });
    
    const removeBtn = row.querySelector('.btn-remove-row');
    removeBtn.addEventListener('click', function() {
        row.remove();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) uploadBtn.click();
    });
}

function addVideoUploadRow() {
    const container = document.getElementById('videoUploadContainer');
    const rowId = 'vid-row-' + (++videoCounter);
    const row = document.createElement('div');
    row.id = rowId;
    row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;';
    row.innerHTML = `
        <input type="file" accept="video/*" style="flex:1;min-width:150px;padding:0.3rem;">
        <button type="button" class="btn-upload-video" style="background:#8b5cf6;color:white;border:none;padding:0.3rem 0.8rem;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-cloud-upload-alt"></i> Upload
        </button>
        <button type="button" class="btn-remove-row" style="background:#ef4444;color:white;border:none;padding:0.3rem 0.8rem;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-times"></i>
        </button>
        <div class="upload-preview" style="display:inline-block;margin-left:0.3rem;"></div>
    `;
    container.appendChild(row);
    
    const uploadBtn = row.querySelector('.btn-upload-video');
    const fileInput = row.querySelector('input[type="file"]');
    const previewDiv = row.querySelector('.upload-preview');
    
    uploadBtn.addEventListener('click', async function() {
        await uploadFile(fileInput, previewDiv, 'video');
    });
    
    const removeBtn = row.querySelector('.btn-remove-row');
    removeBtn.addEventListener('click', function() {
        row.remove();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) uploadBtn.click();
    });
}

async function uploadFile(fileInput, previewDiv, type) {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }
    
    const row = fileInput.closest('div');
    let btn = row ? row.querySelector('.btn-upload-image, .btn-upload-video') : null;
    if (!btn) btn = row ? row.querySelector('button') : null;
    
    const originalText = btn ? btn.innerHTML : 'Upload';
    if (btn) { btn.innerHTML = '⏳'; btn.disabled = true; }
    
    const formData = new FormData();
    formData.append('images', file);
    
    try {
        const response = await fetch(`${API_BASE}/api/upload-multiple`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success && result.urls && result.urls.length > 0) {
            const url = result.urls[0];
            if (row) row.dataset.uploadedUrl = url;
            if (previewDiv) {
                if (type === 'image') {
                    previewDiv.innerHTML = `<img src="${url}" style="max-width:80px;max-height:80px;border-radius:8px;border:2px solid var(--accent-primary);">`;
                } else {
                    previewDiv.innerHTML = `<video src="${url}" style="max-width:100px;max-height:80px;border-radius:8px;border:2px solid var(--accent-primary);" controls></video>`;
                }
            }
            if (fileInput) fileInput.style.display = 'none';
            if (btn) { btn.innerHTML = '✅ Uploaded'; btn.disabled = true; }
            alert('✅ Upload successful!');
        } else {
            alert('❌ Upload failed: ' + (result.error || 'Unknown error'));
            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Error connecting to server.');
        if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
}

function addImagePreview(url) {
    const container = document.getElementById('imageUploadContainer');
    const rowId = 'img-preview-' + (++imageCounter);
    const row = document.createElement('div');
    row.id = rowId;
    row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;';
    row.innerHTML = `
        <img src="${url}" style="max-width:80px;max-height:80px;border-radius:8px;border:2px solid var(--accent-primary);">
        <input type="hidden" value="${url}" class="existing-image-url">
        <button type="button" class="btn-remove-preview" style="background:#ef4444;color:white;border:none;padding:0.3rem 0.8rem;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-times"></i> Remove
        </button>
    `;
    container.appendChild(row);
    row.querySelector('.btn-remove-preview').addEventListener('click', function() {
        row.remove();
    });
}

function addVideoPreview(url) {
    const container = document.getElementById('videoUploadContainer');
    const rowId = 'vid-preview-' + (++videoCounter);
    const row = document.createElement('div');
    row.id = rowId;
    row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;';
    row.innerHTML = `
        <video src="${url}" style="max-width:100px;max-height:80px;border-radius:8px;border:2px solid var(--accent-primary);" controls></video>
        <input type="hidden" value="${url}" class="existing-video-url">
        <button type="button" class="btn-remove-preview" style="background:#ef4444;color:white;border:none;padding:0.3rem 0.8rem;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-times"></i> Remove
        </button>
    `;
    container.appendChild(row);
    row.querySelector('.btn-remove-preview').addEventListener('click', function() {
        row.remove();
    });
}

// ============================================
// SAVE PROJECT
// ============================================

document.getElementById('projectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const groupId = document.getElementById('projectGroupId').value;
    if (!groupId) {
        alert('Please select a group.');
        return;
    }
    
    const projectId = document.getElementById('projectEditId').value;
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const tech = document.getElementById('projectTech').value.split(',').map(s => s.trim()).filter(Boolean);
    const github = document.getElementById('projectGithub').value.trim();
    const demo = document.getElementById('projectDemo').value.trim();
    const readme = document.getElementById('projectReadme').value.trim();
    
    // Collect image URLs
    const imageUrls = [];
    document.querySelectorAll('#imageUploadContainer .existing-image-url').forEach(el => {
        imageUrls.push(el.value);
    });
    document.querySelectorAll('#imageUploadContainer [data-uploaded-url]').forEach(row => {
        imageUrls.push(row.dataset.uploadedUrl);
    });
    
    // Collect video URLs
    const videoUrls = [];
    document.querySelectorAll('#videoUploadContainer .existing-video-url').forEach(el => {
        videoUrls.push(el.value);
    });
    document.querySelectorAll('#videoUploadContainer [data-uploaded-url]').forEach(row => {
        videoUrls.push(row.dataset.uploadedUrl);
    });
    
    // Handle attached files
    const fileInput = document.getElementById('projectFiles');
    const files = [];
    if (fileInput.files.length > 0) {
        for (let f of fileInput.files) {
            const reader = new FileReader();
            const data = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(f);
            });
            files.push({ name: f.name, data, size: f.size, type: f.type });
        }
    }
    
    // Check if we're editing and need to keep existing files
    if (projectId) {
        const group = portfolioData.projectGroups.find(g => g.id == groupId);
        const existingProject = group?.projects?.find(p => p.id == projectId);
        if (existingProject && existingProject.files) {
            // If no new files were added, keep existing
            if (files.length === 0 && existingProject.files.length > 0) {
                files.push(...existingProject.files);
            }
        }
    }
    
    const projectData = {
        title,
        description,
        github,
        demo,
        readme,
        images: imageUrls,
        videos: videoUrls,
        technologies: tech,
        files
    };
    
    try {
        let url;
        if (projectId) {
            url = `${API_BASE}/api/projects/${projectId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        } else {
            url = `${API_BASE}/api/groups/${groupId}/projects`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        }
        await loadData();
        hideAddProject();
        renderGroupsList();
        updateDashboard();
        alert('✅ Project saved!');
    } catch (error) {
        alert('❌ Failed to save project: ' + error.message);
    }
});

// ============================================
// EXPERIENCE CRUD
// ============================================

function renderExperienceList() {
    const container = document.getElementById('experienceList');
    const exps = portfolioData.experience || [];
    if (exps.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No experience added yet.</p>`;
        return;
    }
    container.innerHTML = exps.map((exp, i) => `
        <div class="admin-item">
            <div class="item-info">
                <h4>${exp.role} at ${exp.company}</h4>
                <p>${exp.period}</p>
                <p style="color:var(--text-secondary);font-size:0.9rem;">${exp.description}</p>
            </div>
            <div class="item-actions">
                <button onclick="editExperience('${exp.id}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteExperience('${exp.id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddExperience() {
    document.getElementById('addExperienceForm').style.display = 'block';
    document.getElementById('experienceFormTitle').textContent = 'Add Experience';
    document.getElementById('expSubmitBtn').textContent = 'Add Experience';
    document.getElementById('expEditId').value = '';
    document.getElementById('expCompany').value = '';
    document.getElementById('expRole').value = '';
    document.getElementById('expPeriod').value = '';
    document.getElementById('expDescription').value = '';
    document.getElementById('addExperienceForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddExperience() {
    document.getElementById('addExperienceForm').style.display = 'none';
}

async function editExperience(expId) {
    const exp = portfolioData.experience.find(e => e.id == expId);
    if (!exp) return;
    document.getElementById('addExperienceForm').style.display = 'block';
    document.getElementById('experienceFormTitle').textContent = '✏️ Edit Experience';
    document.getElementById('expSubmitBtn').textContent = 'Update Experience';
    document.getElementById('expEditId').value = expId;
    document.getElementById('expCompany').value = exp.company;
    document.getElementById('expRole').value = exp.role;
    document.getElementById('expPeriod').value = exp.period;
    document.getElementById('expDescription').value = exp.description;
    document.getElementById('addExperienceForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteExperience(expId) {
    if (!confirm('Delete this experience?')) return;
    try {
        await fetch(`${API_BASE}/api/experience/${expId}`, { method: 'DELETE' });
        await loadData();
        renderExperienceList();
        updateDashboard();
        alert('✅ Experience deleted!');
    } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
    }
}

document.getElementById('experienceForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const editId = document.getElementById('expEditId').value;
    const company = document.getElementById('expCompany').value.trim();
    const role = document.getElementById('expRole').value.trim();
    const period = document.getElementById('expPeriod').value.trim();
    const description = document.getElementById('expDescription').value.trim();
    
    try {
        if (editId) {
            await fetch(`${API_BASE}/api/experience/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, role, period, description })
            });
        } else {
            await fetch(`${API_BASE}/api/experience`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, role, period, description })
            });
        }
        await loadData();
        hideAddExperience();
        renderExperienceList();
        updateDashboard();
        alert('✅ Experience saved!');
    } catch (error) {
        alert('❌ Failed to save: ' + error.message);
    }
});

// ============================================
// EDUCATION CRUD
// ============================================

function renderEducationList() {
    const container = document.getElementById('educationList');
    const edu = portfolioData.education || [];
    if (edu.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No education added yet.</p>`;
        return;
    }
    container.innerHTML = edu.map((item, i) => `
        <div class="admin-item">
            <div class="item-info">
                <h4>${item.institution}</h4>
                <p><strong>${item.degree}</strong> ${item.field ? 'in ' + item.field : ''}</p>
                <p style="color:var(--text-light);font-size:0.85rem;">${item.period}</p>
                ${item.description ? `<p style="color:var(--text-secondary);font-size:0.9rem;">${item.description}</p>` : ''}
            </div>
            <div class="item-actions">
                <button onclick="editEducation('${item.id}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteEducation('${item.id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddEducation() {
    document.getElementById('addEducationForm').style.display = 'block';
    document.getElementById('educationFormTitle').textContent = 'Add Education';
    document.getElementById('eduSubmitBtn').textContent = 'Add Education';
    document.getElementById('eduEditId').value = '';
    document.getElementById('eduInstitution').value = '';
    document.getElementById('eduDegree').value = '';
    document.getElementById('eduField').value = '';
    document.getElementById('eduPeriod').value = '';
    document.getElementById('eduDescription').value = '';
    document.getElementById('addEducationForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddEducation() {
    document.getElementById('addEducationForm').style.display = 'none';
}

async function editEducation(eduId) {
    const item = portfolioData.education.find(e => e.id == eduId);
    if (!item) return;
    document.getElementById('addEducationForm').style.display = 'block';
    document.getElementById('educationFormTitle').textContent = '✏️ Edit Education';
    document.getElementById('eduSubmitBtn').textContent = 'Update Education';
    document.getElementById('eduEditId').value = eduId;
    document.getElementById('eduInstitution').value = item.institution;
    document.getElementById('eduDegree').value = item.degree;
    document.getElementById('eduField').value = item.field || '';
    document.getElementById('eduPeriod').value = item.period;
    document.getElementById('eduDescription').value = item.description || '';
    document.getElementById('addEducationForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteEducation(eduId) {
    if (!confirm('Delete this education?')) return;
    try {
        await fetch(`${API_BASE}/api/education/${eduId}`, { method: 'DELETE' });
        await loadData();
        renderEducationList();
        updateDashboard();
        alert('✅ Education deleted!');
    } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
    }
}

document.getElementById('educationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const editId = document.getElementById('eduEditId').value;
    const institution = document.getElementById('eduInstitution').value.trim();
    const degree = document.getElementById('eduDegree').value.trim();
    const field = document.getElementById('eduField').value.trim();
    const period = document.getElementById('eduPeriod').value.trim();
    const description = document.getElementById('eduDescription').value.trim();
    
    try {
        if (editId) {
            await fetch(`${API_BASE}/api/education/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ institution, degree, field, period, description })
            });
        } else {
            await fetch(`${API_BASE}/api/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ institution, degree, field, period, description })
            });
        }
        await loadData();
        hideAddEducation();
        renderEducationList();
        updateDashboard();
        alert('✅ Education saved!');
    } catch (error) {
        alert('❌ Failed to save: ' + error.message);
    }
});

// ============================================
// CERTIFICATIONS CRUD
// ============================================

function renderCertificationsList() {
    const container = document.getElementById('certificationsList');
    const certs = portfolioData.certifications || [];
    if (certs.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No certifications added yet.</p>`;
        return;
    }
    container.innerHTML = certs.map((cert, i) => `
        <div class="admin-item">
            <div class="item-info">
                <h4>${cert.name}</h4>
                <p><strong>${cert.issuer}</strong> ${cert.date ? '· ' + cert.date : ''}</p>
                ${cert.description ? `<p style="color:var(--text-secondary);font-size:0.9rem;">${cert.description}</p>` : ''}
                ${cert.file ? `<p><a href="${cert.file}" target="_blank" style="color:var(--accent-primary);">📎 View Certificate</a></p>` : ''}
                ${cert.link ? `<p><a href="${cert.link}" target="_blank" style="color:var(--accent-primary);">🔗 Verify</a></p>` : ''}
            </div>
            <div class="item-actions">
                <button onclick="editCertification('${cert.id}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCertification('${cert.id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddCertification() {
    document.getElementById('addCertificationForm').style.display = 'block';
    document.getElementById('certFormTitle').textContent = 'Add Certification';
    document.getElementById('certSubmitBtn').textContent = 'Add Certification';
    document.getElementById('certEditId').value = '';
    document.getElementById('certName').value = '';
    document.getElementById('certIssuer').value = '';
    document.getElementById('certDate').value = '';
    document.getElementById('certDescription').value = '';
    document.getElementById('certLink').value = '';
    document.getElementById('certFilePreview').innerHTML = '';
    document.getElementById('addCertificationForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddCertification() {
    document.getElementById('addCertificationForm').style.display = 'none';
}

async function editCertification(certId) {
    const cert = portfolioData.certifications.find(c => c.id == certId);
    if (!cert) return;
    document.getElementById('addCertificationForm').style.display = 'block';
    document.getElementById('certFormTitle').textContent = '✏️ Edit Certification';
    document.getElementById('certSubmitBtn').textContent = 'Update Certification';
    document.getElementById('certEditId').value = certId;
    document.getElementById('certName').value = cert.name;
    document.getElementById('certIssuer').value = cert.issuer;
    document.getElementById('certDate').value = cert.date || '';
    document.getElementById('certDescription').value = cert.description || '';
    document.getElementById('certLink').value = cert.link || '';
    if (cert.file) {
        document.getElementById('certFilePreview').innerHTML = `<a href="${cert.file}" target="_blank">View File</a>`;
    }
    document.getElementById('addCertificationForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteCertification(certId) {
    if (!confirm('Delete this certification?')) return;
    try {
        await fetch(`${API_BASE}/api/certifications/${certId}`, { method: 'DELETE' });
        await loadData();
        renderCertificationsList();
        updateDashboard();
        alert('✅ Certification deleted!');
    } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
    }
}

document.getElementById('certificationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const editId = document.getElementById('certEditId').value;
    const name = document.getElementById('certName').value.trim();
    const issuer = document.getElementById('certIssuer').value.trim();
    const date = document.getElementById('certDate').value.trim();
    const description = document.getElementById('certDescription').value.trim();
    const link = document.getElementById('certLink').value.trim();
    const fileInput = document.getElementById('certFile');
    let fileData = null;
    
    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        fileData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    } else if (editId) {
        const existing = portfolioData.certifications.find(c => c.id == editId);
        fileData = existing ? existing.file : null;
    }
    
    try {
        if (editId) {
            await fetch(`${API_BASE}/api/certifications/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, issuer, date, description, link, file: fileData })
            });
        } else {
            await fetch(`${API_BASE}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, issuer, date, description, link, file: fileData })
            });
        }
        await loadData();
        hideAddCertification();
        renderCertificationsList();
        updateDashboard();
        alert('✅ Certification saved!');
    } catch (error) {
        alert('❌ Failed to save: ' + error.message);
    }
});

// ============================================
// SOCIAL LINKS CRUD
// ============================================

function renderSocialList() {
    const container = document.getElementById('socialList');
    const social = portfolioData.social || {};
    const entries = Object.entries(social);
    if (entries.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No social links added yet.</p>`;
        return;
    }
    container.innerHTML = entries.map(([key, value], i) => `
        <div class="admin-item">
            <div class="item-info">
                <h4><i class="fab fa-${key}"></i> ${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                <p style="color:var(--text-secondary);font-size:0.9rem;">${value}</p>
            </div>
            <div class="item-actions">
                <button onclick="editSocial('${key}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSocial('${key}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddSocial() {
    document.getElementById('addSocialForm').style.display = 'block';
    document.getElementById('socialFormTitle').textContent = 'Add Social Link';
    document.getElementById('socialSubmitBtn').textContent = 'Add Link';
    document.getElementById('socialEditPlatform').value = '';
    document.getElementById('socialPlatform').value = '';
    document.getElementById('socialIcon').value = '';
    document.getElementById('socialUrl').value = '';
    document.getElementById('addSocialForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddSocial() {
    document.getElementById('addSocialForm').style.display = 'none';
}

async function editSocial(platform) {
    const url = portfolioData.social[platform];
    if (!url) return;
    document.getElementById('addSocialForm').style.display = 'block';
    document.getElementById('socialFormTitle').textContent = '✏️ Edit Social Link';
    document.getElementById('socialSubmitBtn').textContent = 'Update Link';
    document.getElementById('socialEditPlatform').value = platform;
    document.getElementById('socialPlatform').value = platform;
    document.getElementById('socialIcon').value = `fab fa-${platform}`;
    document.getElementById('socialUrl').value = url;
    document.getElementById('addSocialForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteSocial(platform) {
    if (!confirm('Delete this social link?')) return;
    try {
        await fetch(`${API_BASE}/api/social/${platform}`, { method: 'DELETE' });
        await loadData();
        renderSocialList();
        updateDashboard();
        alert('✅ Social link deleted!');
    } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
    }
}

document.getElementById('socialForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const editPlatform = document.getElementById('socialEditPlatform').value;
    const platform = document.getElementById('socialPlatform').value.trim();
    const icon = document.getElementById('socialIcon').value.trim();
    const url = document.getElementById('socialUrl').value.trim();
    if (!platform || !url) {
        alert('Please fill all fields.');
        return;
    }
    
    try {
        // Delete old platform if editing
        if (editPlatform && editPlatform !== platform) {
            await fetch(`${API_BASE}/api/social/${editPlatform}`, { method: 'DELETE' });
        }
        // Add/Update new platform
        await fetch(`${API_BASE}/api/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, icon, url })
        });
        await loadData();
        hideAddSocial();
        renderSocialList();
        updateDashboard();
        alert('✅ Social link saved!');
    } catch (error) {
        alert('❌ Failed to save: ' + error.message);
    }
});

// ============================================
// RESUME
// ============================================

function renderResumePreview() {
    const resume = portfolioData.personal?.resume;
    const preview = document.getElementById('resumePreview');
    if (resume) {
        preview.innerHTML = `<a href="${resume}" target="_blank" style="color:var(--accent-primary);">📄 View Resume</a>`;
    } else {
        preview.innerHTML = '';
    }
}

document.getElementById('resumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('resumeFile');
    if (fileInput.files.length === 0) {
        alert('Please select a PDF file.');
        return;
    }
    const reader = new FileReader();
    const fileData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    });
    portfolioData.personal.resume = fileData;
    await saveData();
    renderResumePreview();
    alert('✅ Resume uploaded!');
});

// ============================================
// WELCOME VIDEO
// ============================================

function renderWelcomeVideoPreview() {
    const video = portfolioData.videos?.welcome;
    const preview = document.getElementById('welcomeVideoPreview');
    if (video) {
        preview.innerHTML = `<video controls style="max-width:300px;max-height:200px;border-radius:12px;border:2px solid var(--border-color);"><source src="${video}"></video>`;
    } else {
        preview.innerHTML = '';
    }
}

document.getElementById('welcomeVideoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('welcomeVideo');
    if (fileInput.files.length === 0) {
        alert('Please select a video.');
        return;
    }
    const reader = new FileReader();
    const videoData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    });
    portfolioData.videos.welcome = videoData;
    await saveData();
    renderWelcomeVideoPreview();
    alert('✅ Welcome video uploaded!');
});

// ============================================
// MESSAGES (from backend)
// ============================================

async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE}/api/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const messages = await response.json();
        document.getElementById('statMessages').textContent = messages.length;
        return messages;
    } catch (error) {
        console.error('Error loading messages:', error);
        return [];
    }
}

async function renderMessages() {
    const container = document.getElementById('messagesList');
    const messages = await loadMessages();
    
    if (messages.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No messages yet.</p>`;
        return;
    }
    
    container.innerHTML = messages.map((msg, i) => `
        <div class="message-item">
            <div class="message-header">
                <span class="sender"><strong>${msg.name}</strong> (${msg.email})</span>
                <span class="date">${new Date(msg.date).toLocaleString()}</span>
            </div>
            <div class="message-body">
                <p><strong>Subject:</strong> ${msg.subject || 'No subject'}</p>
                <p>${msg.message}</p>
            </div>
            <button onclick="deleteMessage(${msg.id})" class="btn-delete" style="margin-top:0.5rem;">Delete</button>
        </div>
    `).join('');
}

async function deleteMessage(messageId) {
    if (!confirm('Delete this message?')) return;
    try {
        await fetch(`${API_BASE}/api/messages/${messageId}`, { method: 'DELETE' });
        renderMessages();
        updateDashboard();
        alert('✅ Message deleted!');
    } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
    }
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', initAdmin);
console.log('✅ admin.js loaded and ready!');