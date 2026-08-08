// ============================================
// ADMIN.JS - Complete Admin Panel (Step 2: Skills)
// ============================================

console.log('✅ admin.js loaded');

// Check login
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

let portfolioData = {};
let imageCounter = 0;
let videoCounter = 0;

// ============================================
// SERVER URL - POINTS TO RENDER BACKEND
// ============================================

const SERVER_URL = 'https://portfolio-cms-gqrm.onrender.com';

// ============================================
// INITIALIZE
// ============================================

function initAdmin() {
    loadData();
    setupTabs();
    setupSidebarButtons();
    updateDashboard();
    renderAll();
    setupDynamicUploads();
}

// ============================================
// LOAD DATA
// ============================================

function loadData() {
    const saved = localStorage.getItem('portfolioData');
    if (saved) {
        try {
            portfolioData = JSON.parse(saved);
            if (!portfolioData.projectGroups) portfolioData.projectGroups = [];
            if (!portfolioData.experience) portfolioData.experience = [];
            if (!portfolioData.education) portfolioData.education = [];
            if (!portfolioData.certifications) portfolioData.certifications = [];
            if (!portfolioData.skills) portfolioData.skills = [];
            if (!portfolioData.social) portfolioData.social = {};
            if (!portfolioData.videos) portfolioData.videos = {};
            if (!portfolioData.personal) portfolioData.personal = {};
            if (!portfolioData.about) portfolioData.about = { paragraphs: [] };
        } catch (e) {
            console.error('Error parsing data:', e);
            resetDefaultData();
        }
    } else {
        resetDefaultData();
    }
    renderAll();
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

function saveData() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    updateDashboard();
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
    renderSkillsList();
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
    document.getElementById('statSkills').textContent = portfolioData.skills?.length || 0;
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    document.getElementById('statMessages').textContent = messages.length;
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
    if (tabId === 'skills') renderSkillsList();
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

document.getElementById('profileForm').addEventListener('submit', function(e) {
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
    saveData();
    alert('✅ Profile saved!');
    renderProfileForm();
    updateDashboard();
});

document.getElementById('profilePicture').addEventListener('change', function(e) {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.style.cssText = 'width:150px;height:150px;border-radius:50%;object-fit:cover;';
            document.getElementById('profilePicturePreview').innerHTML = '';
            document.getElementById('profilePicturePreview').appendChild(img);
            portfolioData.personal.profileImage = ev.target.result;
            saveData();
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('aboutImage').addEventListener('change', function(e) {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.style.cssText = 'max-width:200px;max-height:150px;object-fit:cover;border-radius:12px;';
            document.getElementById('aboutImagePreview').innerHTML = '';
            document.getElementById('aboutImagePreview').appendChild(img);
            portfolioData.personal.aboutImage = ev.target.result;
            saveData();
        };
        reader.readAsDataURL(file);
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
    container.innerHTML = groups.map((group, gIndex) => `
        <div style="background:var(--bg-card);padding:1.5rem;border-radius:16px;border:1px solid var(--border-color);margin-bottom:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <div>
                    <h3><i class="${group.icon || 'fas fa-folder'}"></i> ${group.name}</h3>
                    <p style="color:var(--text-secondary);font-size:0.9rem;">${group.description || ''}</p>
                </div>
                <div style="display:flex;gap:0.5rem;">
                    <button onclick="editGroup(${gIndex})" class="btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteGroup(${gIndex})" class="btn-delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                <h4 style="margin-bottom:0.5rem;">Projects (${group.projects?.length || 0})</h4>
                <div style="display:grid;gap:0.8rem;">
                    ${(group.projects || []).map((project, pIndex) => `
                        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-primary);padding:0.8rem 1rem;border-radius:8px;border:1px solid var(--border-color);">
                            <div>
                                <strong>${project.title}</strong>
                                <span style="color:var(--text-light);font-size:0.8rem;margin-left:0.5rem;">
                                    ${project.technologies ? project.technologies.join(', ') : ''}
                                </span>
                            </div>
                            <div style="display:flex;gap:0.5rem;">
                                <button onclick="editProject(${gIndex}, ${pIndex})" class="btn-edit"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteProject(${gIndex}, ${pIndex})" class="btn-delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="showAddProject(${gIndex})" class="btn secondary" style="margin-top:1rem;padding:0.4rem 1rem;font-size:0.85rem;">
                    <i class="fas fa-plus"></i> Add Project
                </button>
            </div>
        </div>
    `).join('');
}

// ===== GROUP CRUD =====

function showAddGroup() {
    document.getElementById('addGroupForm').style.display = 'block';
    document.getElementById('groupFormTitle').textContent = '📂 Create New Project Group';
    document.getElementById('groupSubmitBtn').textContent = 'Create Group';
    document.getElementById('groupEditIndex').value = -1;
    document.getElementById('groupName').value = '';
    document.getElementById('groupIcon').value = 'fas fa-folder';
    document.getElementById('groupDescription').value = '';
    document.getElementById('addGroupForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddGroup() {
    document.getElementById('addGroupForm').style.display = 'none';
}

function editGroup(index) {
    const group = portfolioData.projectGroups[index];
    if (!group) return;
    document.getElementById('addGroupForm').style.display = 'block';
    document.getElementById('groupFormTitle').textContent = '✏️ Edit Project Group';
    document.getElementById('groupSubmitBtn').textContent = 'Update Group';
    document.getElementById('groupEditIndex').value = index;
    document.getElementById('groupName').value = group.name;
    document.getElementById('groupIcon').value = group.icon || 'fas fa-folder';
    document.getElementById('groupDescription').value = group.description || '';
    document.getElementById('addGroupForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteGroup(index) {
    if (!confirm('Delete this group and all its projects?')) return;
    portfolioData.projectGroups.splice(index, 1);
    saveData();
    renderGroupsList();
    updateDashboard();
}

document.getElementById('groupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('groupEditIndex').value);
    const name = document.getElementById('groupName').value.trim();
    const icon = document.getElementById('groupIcon').value.trim() || 'fas fa-folder';
    const description = document.getElementById('groupDescription').value.trim();
    const groupData = { name, icon, description, projects: [] };
    if (editIndex >= 0) {
        const existing = portfolioData.projectGroups[editIndex];
        groupData.projects = existing.projects || [];
        portfolioData.projectGroups[editIndex] = groupData;
    } else {
        portfolioData.projectGroups.push(groupData);
    }
    saveData();
    hideAddGroup();
    renderGroupsList();
    updateDashboard();
    alert('✅ Group saved!');
});

// ============================================
// PROJECT CRUD WITH DYNAMIC UPLOADS
// ============================================

function showAddProject(groupIndex) {
    if (groupIndex !== undefined) {
        document.getElementById('projectGroupSelect').value = groupIndex;
        document.getElementById('selectedGroupDisplay').style.display = 'flex';
        const group = portfolioData.projectGroups[groupIndex];
        document.getElementById('selectedGroupName').textContent = group ? group.name : '';
        document.getElementById('projectGroupId').value = groupIndex;
    } else {
        document.getElementById('selectedGroupDisplay').style.display = 'none';
        document.getElementById('projectGroupId').value = '';
    }
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = '📄 Add New Project';
    document.getElementById('projectSubmitBtn').textContent = 'Save Project';
    document.getElementById('projectEditIndex').value = -1;
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

function editProject(gIndex, pIndex) {
    const group = portfolioData.projectGroups[gIndex];
    if (!group) return;
    const project = group.projects[pIndex];
    if (!project) return;
    
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = '✏️ Edit Project';
    document.getElementById('projectSubmitBtn').textContent = 'Update Project';
    document.getElementById('projectEditIndex').value = pIndex;
    document.getElementById('projectGroupId').value = gIndex;
    document.getElementById('projectGroupSelect').value = gIndex;
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
    images.forEach(url => {
        addImagePreview(url);
    });
    
    const videos = project.videos || [];
    videos.forEach(url => {
        addVideoPreview(url);
    });
    
    const filesPreview = document.getElementById('projectFilesPreview');
    filesPreview.innerHTML = '';
    (project.files || []).forEach(f => {
        filesPreview.innerHTML += `<span style="display:inline-block;background:var(--bg-primary);padding:0.3rem 0.8rem;border-radius:50px;font-size:0.8rem;border:1px solid var(--border-color);">📎 ${f.name}</span>`;
    });
    
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
    updateGroupSelect();
}

function deleteProject(gIndex, pIndex) {
    if (!confirm('Delete this project?')) return;
    const group = portfolioData.projectGroups[gIndex];
    if (!group) return;
    group.projects.splice(pIndex, 1);
    saveData();
    renderGroupsList();
    updateDashboard();
}

function updateGroupSelect() {
    const select = document.getElementById('projectGroupSelect');
    const groups = portfolioData.projectGroups || [];
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Select a group --</option>';
    groups.forEach((g, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = g.name;
        select.appendChild(opt);
    });
    if (currentVal) select.value = currentVal;
}

document.getElementById('projectGroupSelect').addEventListener('change', function() {
    const idx = parseInt(this.value);
    if (!isNaN(idx)) {
        document.getElementById('projectGroupId').value = idx;
        document.getElementById('selectedGroupDisplay').style.display = 'flex';
        const group = portfolioData.projectGroups[idx];
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
        if (this.files.length > 0) {
            uploadBtn.click();
        }
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
        if (this.files.length > 0) {
            uploadBtn.click();
        }
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
    if (!btn) {
        btn = row ? row.querySelector('button') : null;
    }
    
    const originalText = btn ? btn.innerHTML : 'Upload';
    if (btn) {
        btn.innerHTML = '⏳';
        btn.disabled = true;
    }
    
    const formData = new FormData();
    formData.append('images', file);
    
    try {
        const response = await fetch(`${SERVER_URL}/api/upload-multiple`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success && result.urls && result.urls.length > 0) {
            const url = result.urls[0];
            if (row) {
                row.dataset.uploadedUrl = url;
            }
            if (previewDiv) {
                if (type === 'image') {
                    previewDiv.innerHTML = `<img src="${url}" style="max-width:80px;max-height:80px;border-radius:8px;border:2px solid var(--accent-primary);">`;
                } else {
                    previewDiv.innerHTML = `<video src="${url}" style="max-width:100px;max-height:80px;border-radius:8px;border:2px solid var(--accent-primary);" controls></video>`;
                }
            }
            if (fileInput) fileInput.style.display = 'none';
            if (btn) {
                btn.innerHTML = '✅ Uploaded';
                btn.disabled = true;
            }
            alert('✅ Upload successful!');
        } else {
            alert('❌ Upload failed: ' + (result.error || 'Unknown error'));
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Error connecting to server. Make sure server is running on Render!');
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
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

document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const gIndex = parseInt(document.getElementById('projectGroupId').value);
    if (isNaN(gIndex) || gIndex < 0 || gIndex >= portfolioData.projectGroups.length) {
        alert('Please select a valid group.');
        return;
    }
    const group = portfolioData.projectGroups[gIndex];
    const editIndex = parseInt(document.getElementById('projectEditIndex').value);
    
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const tech = document.getElementById('projectTech').value.split(',').map(s => s.trim()).filter(Boolean);
    const github = document.getElementById('projectGithub').value.trim();
    const demo = document.getElementById('projectDemo').value.trim();
    const readme = document.getElementById('projectReadme').value.trim();
    
    const imageUrls = [];
    document.querySelectorAll('#imageUploadContainer .existing-image-url').forEach(el => {
        imageUrls.push(el.value);
    });
    document.querySelectorAll('#imageUploadContainer [data-uploaded-url]').forEach(row => {
        imageUrls.push(row.dataset.uploadedUrl);
    });
    
    const videoUrls = [];
    document.querySelectorAll('#videoUploadContainer .existing-video-url').forEach(el => {
        videoUrls.push(el.value);
    });
    document.querySelectorAll('#videoUploadContainer [data-uploaded-url]').forEach(row => {
        videoUrls.push(row.dataset.uploadedUrl);
    });
    
    const fileInput = document.getElementById('projectFiles');
    const files = [];
    if (fileInput.files.length > 0) {
        const readFiles = () => {
            return new Promise((resolve) => {
                const promises = [];
                for (let f of fileInput.files) {
                    const p = new Promise((res) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            res({ name: f.name, data: e.target.result, size: f.size, type: f.type });
                        };
                        reader.readAsDataURL(f);
                    });
                    promises.push(p);
                }
                Promise.all(promises).then(results => resolve(results));
            });
        };
        readFiles().then((fileData) => {
            const existingFiles = (editIndex >= 0 && group.projects[editIndex]?.files) || [];
            const allFiles = [...existingFiles, ...fileData];
            saveProjectData(gIndex, editIndex, title, description, tech, github, demo, readme, imageUrls, videoUrls, allFiles);
        });
    } else {
        const existingFiles = (editIndex >= 0 && group.projects[editIndex]?.files) || [];
        saveProjectData(gIndex, editIndex, title, description, tech, github, demo, readme, imageUrls, videoUrls, existingFiles);
    }
});

function saveProjectData(gIndex, editIndex, title, description, tech, github, demo, readme, images, videos, files) {
    const group = portfolioData.projectGroups[gIndex];
    const project = {
        title,
        description,
        technologies: tech,
        github,
        demo,
        readme,
        images,
        videos,
        files
    };
    if (editIndex >= 0) {
        group.projects[editIndex] = project;
    } else {
        group.projects.push(project);
    }
    saveData();
    hideAddProject();
    renderGroupsList();
    updateDashboard();
    alert('✅ Project saved!');
}

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
                <button onclick="editExperience(${i})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteExperience(${i})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddExperience() {
    document.getElementById('addExperienceForm').style.display = 'block';
    document.getElementById('experienceFormTitle').textContent = 'Add Experience';
    document.getElementById('expSubmitBtn').textContent = 'Add Experience';
    document.getElementById('expEditIndex').value = -1;
    document.getElementById('expCompany').value = '';
    document.getElementById('expRole').value = '';
    document.getElementById('expPeriod').value = '';
    document.getElementById('expDescription').value = '';
    document.getElementById('addExperienceForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddExperience() {
    document.getElementById('addExperienceForm').style.display = 'none';
}

function editExperience(index) {
    const exp = portfolioData.experience[index];
    if (!exp) return;
    document.getElementById('addExperienceForm').style.display = 'block';
    document.getElementById('experienceFormTitle').textContent = '✏️ Edit Experience';
    document.getElementById('expSubmitBtn').textContent = 'Update Experience';
    document.getElementById('expEditIndex').value = index;
    document.getElementById('expCompany').value = exp.company;
    document.getElementById('expRole').value = exp.role;
    document.getElementById('expPeriod').value = exp.period;
    document.getElementById('expDescription').value = exp.description;
    document.getElementById('addExperienceForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteExperience(index) {
    if (!confirm('Delete this experience?')) return;
    portfolioData.experience.splice(index, 1);
    saveData();
    renderExperienceList();
    updateDashboard();
}

document.getElementById('experienceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('expEditIndex').value);
    const company = document.getElementById('expCompany').value.trim();
    const role = document.getElementById('expRole').value.trim();
    const period = document.getElementById('expPeriod').value.trim();
    const description = document.getElementById('expDescription').value.trim();
    const expData = { company, role, period, description };
    if (editIndex >= 0) {
        portfolioData.experience[editIndex] = expData;
    } else {
        portfolioData.experience.push(expData);
    }
    saveData();
    hideAddExperience();
    renderExperienceList();
    updateDashboard();
    alert('✅ Experience saved!');
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
                <button onclick="editEducation(${i})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteEducation(${i})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddEducation() {
    document.getElementById('addEducationForm').style.display = 'block';
    document.getElementById('educationFormTitle').textContent = 'Add Education';
    document.getElementById('eduSubmitBtn').textContent = 'Add Education';
    document.getElementById('eduEditIndex').value = -1;
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

function editEducation(index) {
    const item = portfolioData.education[index];
    if (!item) return;
    document.getElementById('addEducationForm').style.display = 'block';
    document.getElementById('educationFormTitle').textContent = '✏️ Edit Education';
    document.getElementById('eduSubmitBtn').textContent = 'Update Education';
    document.getElementById('eduEditIndex').value = index;
    document.getElementById('eduInstitution').value = item.institution;
    document.getElementById('eduDegree').value = item.degree;
    document.getElementById('eduField').value = item.field || '';
    document.getElementById('eduPeriod').value = item.period;
    document.getElementById('eduDescription').value = item.description || '';
    document.getElementById('addEducationForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteEducation(index) {
    if (!confirm('Delete this education?')) return;
    portfolioData.education.splice(index, 1);
    saveData();
    renderEducationList();
    updateDashboard();
}

document.getElementById('educationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('eduEditIndex').value);
    const institution = document.getElementById('eduInstitution').value.trim();
    const degree = document.getElementById('eduDegree').value.trim();
    const field = document.getElementById('eduField').value.trim();
    const period = document.getElementById('eduPeriod').value.trim();
    const description = document.getElementById('eduDescription').value.trim();
    const eduData = { institution, degree, field, period, description };
    if (editIndex >= 0) {
        portfolioData.education[editIndex] = eduData;
    } else {
        portfolioData.education.push(eduData);
    }
    saveData();
    hideAddEducation();
    renderEducationList();
    updateDashboard();
    alert('✅ Education saved!');
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
                <button onclick="editCertification(${i})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCertification(${i})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddCertification() {
    document.getElementById('addCertificationForm').style.display = 'block';
    document.getElementById('certFormTitle').textContent = 'Add Certification';
    document.getElementById('certSubmitBtn').textContent = 'Add Certification';
    document.getElementById('certEditIndex').value = -1;
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

function editCertification(index) {
    const cert = portfolioData.certifications[index];
    if (!cert) return;
    document.getElementById('addCertificationForm').style.display = 'block';
    document.getElementById('certFormTitle').textContent = '✏️ Edit Certification';
    document.getElementById('certSubmitBtn').textContent = 'Update Certification';
    document.getElementById('certEditIndex').value = index;
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

function deleteCertification(index) {
    if (!confirm('Delete this certification?')) return;
    portfolioData.certifications.splice(index, 1);
    saveData();
    renderCertificationsList();
    updateDashboard();
}

document.getElementById('certificationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('certEditIndex').value);
    const name = document.getElementById('certName').value.trim();
    const issuer = document.getElementById('certIssuer').value.trim();
    const date = document.getElementById('certDate').value.trim();
    const description = document.getElementById('certDescription').value.trim();
    const link = document.getElementById('certLink').value.trim();
    const fileInput = document.getElementById('certFile');
    let fileData = null;
    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            fileData = ev.target.result;
            saveCertData(editIndex, name, issuer, date, description, link, fileData);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        const existing = (editIndex >= 0) ? portfolioData.certifications[editIndex] : null;
        fileData = existing ? existing.file : null;
        saveCertData(editIndex, name, issuer, date, description, link, fileData);
    }
});

function saveCertData(editIndex, name, issuer, date, description, link, fileData) {
    const certData = { name, issuer, date, description, link, file: fileData };
    if (editIndex >= 0) {
        portfolioData.certifications[editIndex] = certData;
    } else {
        portfolioData.certifications.push(certData);
    }
    saveData();
    hideAddCertification();
    renderCertificationsList();
    updateDashboard();
    alert('✅ Certification saved!');
});

// ============================================
// SKILLS CRUD
// ============================================

function renderSkillsList() {
    const container = document.getElementById('skillsList');
    const skills = portfolioData.skills || [];
    if (skills.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No skill categories added yet.</p>`;
        return;
    }
    container.innerHTML = skills.map((skill, i) => `
        <div class="admin-item">
            <div class="item-info">
                <h4><i class="${skill.icon || 'fas fa-code'}"></i> ${skill.category}</h4>
                <p style="color:var(--text-secondary);font-size:0.9rem;">${skill.items ? skill.items.join(', ') : ''}</p>
            </div>
            <div class="item-actions">
                <button onclick="editSkill(${i})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSkill(${i})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddSkill() {
    document.getElementById('addSkillForm').style.display = 'block';
    document.getElementById('skillFormTitle').textContent = 'Add Skill Category';
    document.getElementById('skillSubmitBtn').textContent = 'Add Skill Category';
    document.getElementById('skillEditIndex').value = -1;
    document.getElementById('skillCategory').value = '';
    document.getElementById('skillIcon').value = 'fas fa-code';
    document.getElementById('skillItems').value = '';
    document.getElementById('addSkillForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddSkill() {
    document.getElementById('addSkillForm').style.display = 'none';
}

function editSkill(index) {
    const skill = portfolioData.skills[index];
    if (!skill) return;
    document.getElementById('addSkillForm').style.display = 'block';
    document.getElementById('skillFormTitle').textContent = '✏️ Edit Skill Category';
    document.getElementById('skillSubmitBtn').textContent = 'Update Skill Category';
    document.getElementById('skillEditIndex').value = index;
    document.getElementById('skillCategory').value = skill.category;
    document.getElementById('skillIcon').value = skill.icon || 'fas fa-code';
    document.getElementById('skillItems').value = (skill.items || []).join(', ');
    document.getElementById('addSkillForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteSkill(index) {
    if (!confirm('Delete this skill category?')) return;
    portfolioData.skills.splice(index, 1);
    saveData();
    renderSkillsList();
    updateDashboard();
}

document.getElementById('skillForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('skillEditIndex').value);
    const category = document.getElementById('skillCategory').value.trim();
    const icon = document.getElementById('skillIcon').value.trim() || 'fas fa-code';
    const items = document.getElementById('skillItems').value.split(',').map(s => s.trim()).filter(Boolean);
    const skillData = { category, icon, items };
    if (editIndex >= 0) {
        portfolioData.skills[editIndex] = skillData;
    } else {
        portfolioData.skills.push(skillData);
    }
    saveData();
    hideAddSkill();
    renderSkillsList();
    updateDashboard();
    alert('✅ Skill category saved!');
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
                <button onclick="editSocial(${i})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSocial('${key}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddSocial() {
    document.getElementById('addSocialForm').style.display = 'block';
    document.getElementById('socialFormTitle').textContent = 'Add Social Link';
    document.getElementById('socialSubmitBtn').textContent = 'Add Link';
    document.getElementById('socialEditIndex').value = -1;
    document.getElementById('socialPlatform').value = '';
    document.getElementById('socialIcon').value = '';
    document.getElementById('socialUrl').value = '';
    document.getElementById('addSocialForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddSocial() {
    document.getElementById('addSocialForm').style.display = 'none';
}

function editSocial(index) {
    const social = portfolioData.social || {};
    const keys = Object.keys(social);
    const key = keys[index];
    if (!key) return;
    document.getElementById('addSocialForm').style.display = 'block';
    document.getElementById('socialFormTitle').textContent = '✏️ Edit Social Link';
    document.getElementById('socialSubmitBtn').textContent = 'Update Link';
    document.getElementById('socialEditIndex').value = index;
    document.getElementById('socialPlatform').value = key;
    document.getElementById('socialIcon').value = `fab fa-${key}`;
    document.getElementById('socialUrl').value = social[key];
    document.getElementById('addSocialForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteSocial(key) {
    if (!confirm('Delete this social link?')) return;
    delete portfolioData.social[key];
    saveData();
    renderSocialList();
    updateDashboard();
}

document.getElementById('socialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('socialEditIndex').value);
    const platform = document.getElementById('socialPlatform').value.trim();
    const icon = document.getElementById('socialIcon').value.trim();
    const url = document.getElementById('socialUrl').value.trim();
    if (!platform || !url) {
        alert('Please fill all fields.');
        return;
    }
    if (editIndex >= 0) {
        const oldKey = Object.keys(portfolioData.social)[editIndex];
        if (oldKey && oldKey !== platform) {
            delete portfolioData.social[oldKey];
        }
    }
    portfolioData.social[platform] = url;
    saveData();
    hideAddSocial();
    renderSocialList();
    updateDashboard();
    alert('✅ Social link saved!');
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

document.getElementById('resumeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('resumeFile');
    if (fileInput.files.length === 0) {
        alert('Please select a PDF file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
        portfolioData.personal.resume = ev.target.result;
        saveData();
        renderResumePreview();
        alert('✅ Resume uploaded!');
    };
    reader.readAsDataURL(fileInput.files[0]);
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

document.getElementById('welcomeVideoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('welcomeVideo');
    if (fileInput.files.length === 0) {
        alert('Please select a video.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
        portfolioData.videos.welcome = ev.target.result;
        saveData();
        renderWelcomeVideoPreview();
        alert('✅ Welcome video uploaded!');
    };
    reader.readAsDataURL(fileInput.files[0]);
});

// ============================================
// MESSAGES
// ============================================

function renderMessages() {
    const container = document.getElementById('messagesList');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    if (messages.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No messages yet.</p>`;
        return;
    }
    container.innerHTML = messages.map((msg, i) => `
        <div class="message-item">
            <div class="message-header">
                <span class="sender"><strong>${msg.name}</strong> (${msg.email})</span>
                <span class="date">${msg.date}</span>
            </div>
            <div class="message-body">
                <p><strong>Subject:</strong> ${msg.subject}</p>
                <p>${msg.message}</p>
            </div>
            <button onclick="deleteMessage(${i})" class="btn-delete" style="margin-top:0.5rem;">Delete</button>
        </div>
    `).join('');
}

function deleteMessage(index) {
    if (!confirm('Delete this message?')) return;
    let messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.splice(index, 1);
    localStorage.setItem('messages', JSON.stringify(messages));
    renderMessages();
    updateDashboard();
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