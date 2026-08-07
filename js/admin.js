// ============================================
// ADMIN.JS - Complete with Project Groups
// ============================================

console.log('✅ admin.js loaded');

// Check login
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

let portfolioData = {
    personal: {},
    about: { paragraphs: [] },
    skills: [],
    projectGroups: [],
    experience: [],
    education: [],
    certifications: [],
    social: {},
    videos: {},
    footer: ''
};

let messages = [];

// ============================================
// LOAD DATA
// ============================================

function loadData() {
    const savedData = localStorage.getItem('portfolioData');
    if (savedData) {
        try {
            portfolioData = JSON.parse(savedData);
            if (!portfolioData.projectGroups) portfolioData.projectGroups = [];
            if (!portfolioData.education) portfolioData.education = [];
            if (!portfolioData.certifications) portfolioData.certifications = [];
            if (!portfolioData.personal) portfolioData.personal = {};
            if (!portfolioData.about) portfolioData.about = { paragraphs: [] };
            if (!portfolioData.experience) portfolioData.experience = [];
            if (!portfolioData.social) portfolioData.social = {};
            if (!portfolioData.videos) portfolioData.videos = {};
        } catch (e) {
            console.error('Error parsing data:', e);
        }
    }
    
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        try {
            messages = JSON.parse(savedMessages);
        } catch (e) {
            messages = [];
        }
    }
    
    renderAll();
}

// ============================================
// RENDER ALL
// ============================================

function renderAll() {
    renderStats();
    renderProfileForm();
    renderGroupsAndProjects();
    populateGroupSelect();
    renderExperience();
    renderEducation();
    renderCertifications();
    renderSocialLinks();
    renderResumeInfo();
    renderVideoInfo();
    renderMessages();
}

// ============================================
// STATS
// ============================================

function renderStats() {
    const totalProjects = portfolioData.projectGroups?.reduce((sum, g) => sum + (g.projects?.length || 0), 0) || 0;
    document.getElementById('statGroups').textContent = portfolioData.projectGroups?.length || 0;
    document.getElementById('statProjects').textContent = totalProjects;
    document.getElementById('statExperience').textContent = portfolioData.experience?.length || 0;
    document.getElementById('statEducation').textContent = portfolioData.education?.length || 0;
    document.getElementById('statCertifications').textContent = portfolioData.certifications?.length || 0;
    document.getElementById('statMessages').textContent = messages?.length || 0;
}

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
    document.getElementById('profileBio').value = (portfolioData.about?.paragraphs || []).join('\n\n');
    document.getElementById('profileEmail').value = p.email || '';
    
    if (p.profileImage) {
        document.getElementById('profilePicturePreview').innerHTML = `
            <img src="${p.profileImage}" style="width:150px;height:150px;border-radius:50%;border:3px solid var(--accent-primary);">
        `;
    }
    if (p.aboutImage) {
        document.getElementById('aboutImagePreview').innerHTML = `
            <img src="${p.aboutImage}" style="max-width:200px;max-height:150px;border-radius:8px;border:2px solid var(--accent-primary);">
        `;
    }
}

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const bioText = document.getElementById('profileBio').value;
    const paragraphs = bioText.split('\n\n').filter(p => p.trim());
    
    portfolioData.personal.name = document.getElementById('profileName').value;
    portfolioData.personal.title = document.getElementById('profileTitle').value;
    portfolioData.personal.badge = document.getElementById('profileBadge').value;
    portfolioData.personal.heroSubtitle = document.getElementById('profileSubtitle').value;
    portfolioData.personal.welcomeMessage = document.getElementById('welcomeMessage').value;
    portfolioData.personal.email = document.getElementById('profileEmail').value;
    portfolioData.about.paragraphs = paragraphs;
    
    let uploads = 0;
    let totalUploads = 0;
    
    const picFile = document.getElementById('profilePicture').files[0];
    if (picFile) {
        totalUploads++;
        const reader = new FileReader();
        reader.onload = function(e) {
            portfolioData.personal.profileImage = e.target.result;
            uploads++;
            if (uploads === totalUploads) saveAndRefresh();
        };
        reader.readAsDataURL(picFile);
    }
    
    const aboutFile = document.getElementById('aboutImage').files[0];
    if (aboutFile) {
        totalUploads++;
        const reader = new FileReader();
        reader.onload = function(e) {
            portfolioData.personal.aboutImage = e.target.result;
            uploads++;
            if (uploads === totalUploads) saveAndRefresh();
        };
        reader.readAsDataURL(aboutFile);
    }
    
    function saveAndRefresh() {
        saveData();
        renderProfileForm();
        alert('✅ Profile updated successfully!');
    }
    
    if (totalUploads === 0) {
        saveData();
        alert('✅ Profile updated successfully!');
    }
});

// ============================================
// POPULATE GROUP SELECT
// ============================================

function populateGroupSelect() {
    const select = document.getElementById('projectGroupSelect');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Select a group --</option>';
    
    (portfolioData.projectGroups || []).forEach((group, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = group.name;
        select.appendChild(option);
    });
    
    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
}

// ============================================
// GROUPS AND PROJECTS - RENDER
// ============================================

function renderGroupsAndProjects() {
    const list = document.getElementById('groupsList');
    const groups = portfolioData.projectGroups || [];
    
    if (groups.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:3rem;background:var(--bg-card);border-radius:16px;border:1px solid var(--border-color);">
                <i class="fas fa-folder-open" style="font-size:4rem;color:var(--text-light);margin-bottom:1rem;"></i>
                <p style="color:var(--text-secondary);font-size:1.1rem;">No project groups created yet.</p>
                <p style="color:var(--text-light);margin-bottom:1rem;">Create your first group to start adding projects!</p>
                <button onclick="showAddGroup()" class="btn primary" style="margin-top:0.5rem;">
                    <i class="fas fa-folder-plus"></i> Create Your First Group
                </button>
            </div>
        `;
        return;
    }
    
    list.innerHTML = groups.map((group, index) => {
        const projectCount = group.projects?.length || 0;
        const projects = group.projects || [];
        
        return `
        <div class="admin-item" style="flex-direction:column;align-items:stretch;gap:1rem;padding:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                <div style="display:flex;align-items:center;gap:1rem;">
                    <div style="font-size:2.5rem;color:var(--accent-primary);"><i class="${group.icon || 'fas fa-folder'}"></i></div>
                    <div>
                        <h4 style="font-size:1.2rem;">${group.name}</h4>
                        <p style="color:var(--text-secondary);font-size:0.9rem;">${group.description || ''}</p>
                        <small style="color:var(--text-light);">${projectCount} project${projectCount !== 1 ? 's' : ''} in this group</small>
                    </div>
                </div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button onclick="addProjectToGroup(${index})" class="btn-edit" style="background:#22c55e;color:white;padding:0.4rem 0.8rem;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-plus"></i> Add Project
                    </button>
                    <button onclick="editGroup(${index})" class="btn-edit" style="background:var(--accent-primary);color:white;padding:0.4rem 0.8rem;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteGroup(${index})" class="btn-delete" style="background:#ef4444;color:white;padding:0.4rem 0.8rem;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${projectCount > 0 ? `
                <div style="display:flex;flex-wrap:wrap;gap:0.8rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                    ${projects.map((p, pIdx) => `
                        <div style="background:var(--bg-primary);padding:0.4rem 1rem;border-radius:50px;border:1px solid var(--border-color);display:inline-flex;align-items:center;gap:0.5rem;">
                            <i class="fas fa-file-code" style="font-size:0.8rem;color:var(--accent-primary);"></i>
                            <span style="font-size:0.85rem;">${p.title}</span>
                            <button onclick="editProject(${index}, ${pIdx})" style="background:none;border:none;color:var(--accent-primary);cursor:pointer;padding:0 0.3rem;">
                                <i class="fas fa-edit" style="font-size:0.7rem;"></i>
                            </button>
                            <button onclick="deleteProject(${index}, ${pIdx})" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:0 0.3rem;">
                                <i class="fas fa-trash" style="font-size:0.7rem;"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <p style="color:var(--text-light);font-size:0.9rem;padding-top:0.5rem;border-top:1px solid var(--border-color);">
                    No projects in this group. 
                    <button onclick="addProjectToGroup(${index})" style="background:none;border:none;color:var(--accent-primary);cursor:pointer;text-decoration:underline;font-weight:600;">
                        Add a project
                    </button>
                </p>
            `}
        </div>
        `;
    }).join('');
}

// ============================================
// ADD PROJECT TO GROUP
// ============================================

function addProjectToGroup(groupIndex) {
    const group = portfolioData.projectGroups[groupIndex];
    if (!group) {
        alert('Group not found!');
        return;
    }
    
    const select = document.getElementById('projectGroupSelect');
    if (select) {
        select.value = groupIndex;
    }
    
    showAddProjectForm(groupIndex);
}

// ============================================
// SHOW ADD PROJECT FORM
// ============================================

function showAddProjectForm(groupIndex) {
    const group = portfolioData.projectGroups[groupIndex];
    if (!group) {
        alert('Group not found!');
        return;
    }
    
    document.getElementById('projectGroupId').value = groupIndex;
    document.getElementById('projectGroupSelect').value = groupIndex;
    
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = `📄 Add Project to "${group.name}"`;
    document.getElementById('projectSubmitBtn').textContent = 'Save Project';
    document.getElementById('projectEditIndex').value = '-1';
    document.getElementById('projectForm').reset();
    document.getElementById('projectImagesPreview').innerHTML = '';
    document.getElementById('projectVideoPreview').innerHTML = '';
    document.getElementById('projectFilesPreview').innerHTML = '';
    
    const groupDisplay = document.getElementById('selectedGroupDisplay');
    if (groupDisplay) {
        groupDisplay.style.display = 'flex';
        groupDisplay.innerHTML = `
            <i class="fas fa-folder"></i>
            Adding project to: <strong>${group.name}</strong>
            <span style="font-weight:400;font-size:0.85rem;opacity:0.8;">(Group: ${group.name})</span>
        `;
    }
    
    const wrapper = document.getElementById('groupSelectWrapper');
    if (wrapper) {
        wrapper.style.display = 'none';
    }
    
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// SHOW ADD PROJECT (from button)
// ============================================

function showAddProject() {
    const groups = portfolioData.projectGroups || [];
    
    if (groups.length === 0) {
        alert('⚠️ Please create a group first!\n\nClick "Create New Group" to create one.');
        return;
    }
    
    if (groups.length === 1) {
        showAddProjectForm(0);
        return;
    }
    
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = '📄 Add New Project';
    document.getElementById('projectSubmitBtn').textContent = 'Save Project';
    document.getElementById('projectEditIndex').value = '-1';
    document.getElementById('projectForm').reset();
    document.getElementById('projectImagesPreview').innerHTML = '';
    document.getElementById('projectVideoPreview').innerHTML = '';
    document.getElementById('projectFilesPreview').innerHTML = '';
    
    const wrapper = document.getElementById('groupSelectWrapper');
    if (wrapper) {
        wrapper.style.display = 'block';
    }
    
    const select = document.getElementById('projectGroupSelect');
    if (select) {
        select.value = '';
        select.focus();
    }
    
    const groupDisplay = document.getElementById('selectedGroupDisplay');
    if (groupDisplay) {
        groupDisplay.style.display = 'flex';
        groupDisplay.innerHTML = `
            <i class="fas fa-info-circle"></i>
            Select a group from the dropdown below
        `;
    }
    
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// HIDE ADD PROJECT
// ============================================

function hideAddProject() {
    document.getElementById('addProjectForm').style.display = 'none';
    document.getElementById('projectForm').reset();
    document.getElementById('projectImagesPreview').innerHTML = '';
    document.getElementById('projectVideoPreview').innerHTML = '';
    document.getElementById('projectFilesPreview').innerHTML = '';
    
    const wrapper = document.getElementById('groupSelectWrapper');
    if (wrapper) {
        wrapper.style.display = 'block';
    }
}

// ============================================
// GROUPS - CREATE, EDIT, DELETE
// ============================================

function showAddGroup() {
    document.getElementById('addGroupForm').style.display = 'block';
    document.getElementById('groupFormTitle').textContent = '📂 Create New Project Group';
    document.getElementById('groupSubmitBtn').textContent = 'Create Group';
    document.getElementById('groupEditIndex').value = '-1';
    document.getElementById('groupForm').reset();
    document.getElementById('addGroupForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddGroup() {
    document.getElementById('addGroupForm').style.display = 'none';
    document.getElementById('groupForm').reset();
}

function editGroup(index) {
    const group = portfolioData.projectGroups[index];
    if (!group) return;
    
    document.getElementById('addGroupForm').style.display = 'block';
    document.getElementById('groupFormTitle').textContent = '✏️ Edit Group';
    document.getElementById('groupSubmitBtn').textContent = 'Update Group';
    document.getElementById('groupEditIndex').value = index;
    
    document.getElementById('groupName').value = group.name || '';
    document.getElementById('groupIcon').value = group.icon || 'fas fa-folder';
    document.getElementById('groupDescription').value = group.description || '';
    
    document.getElementById('addGroupForm').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('groupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('groupEditIndex').value);
    const group = {
        name: document.getElementById('groupName').value,
        icon: document.getElementById('groupIcon').value || 'fas fa-folder',
        description: document.getElementById('groupDescription').value,
        projects: []
    };
    
    if (editIndex >= 0 && portfolioData.projectGroups[editIndex]) {
        group.projects = portfolioData.projectGroups[editIndex].projects || [];
        portfolioData.projectGroups[editIndex] = group;
        alert('✅ Group updated successfully!');
    } else {
        portfolioData.projectGroups.push(group);
        alert('✅ Group created successfully!');
    }
    
    saveData();
    renderGroupsAndProjects();
    populateGroupSelect();
    hideAddGroup();
    renderStats();
});

function deleteGroup(index) {
    if (confirm('Delete this group and all its projects?')) {
        portfolioData.projectGroups.splice(index, 1);
        saveData();
        renderGroupsAndProjects();
        populateGroupSelect();
        renderStats();
    }
}

// ============================================
// PROJECTS - EDIT, DELETE
// ============================================

function editProject(groupIndex, projectIndex) {
    const group = portfolioData.projectGroups[parseInt(groupIndex)];
    if (!group) return;
    
    const project = group.projects[parseInt(projectIndex)];
    if (!project) return;
    
    document.getElementById('addProjectForm').style.display = 'block';
    document.getElementById('projectFormTitle').textContent = '✏️ Edit Project';
    document.getElementById('projectSubmitBtn').textContent = 'Update Project';
    document.getElementById('projectEditIndex').value = projectIndex;
    document.getElementById('projectGroupId').value = groupIndex;
    document.getElementById('projectGroupSelect').value = groupIndex;
    
    const wrapper = document.getElementById('groupSelectWrapper');
    if (wrapper) {
        wrapper.style.display = 'none';
    }
    
    const groupDisplay = document.getElementById('selectedGroupDisplay');
    if (groupDisplay) {
        groupDisplay.style.display = 'flex';
        groupDisplay.innerHTML = `
            <i class="fas fa-folder"></i>
            Editing project in: <strong>${group.name}</strong>
        `;
    }
    
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectTech').value = project.technologies ? project.technologies.join(', ') : '';
    document.getElementById('projectGithub').value = project.github || '';
    document.getElementById('projectDemo').value = project.demo || '';
    document.getElementById('projectReadme').value = project.readme || '';
    
    if (project.images && project.images.length > 0) {
        document.getElementById('projectImagesPreview').innerHTML = project.images.map(img => `
            <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--accent-primary);">
        `).join('');
    }
    
    if (project.video) {
        document.getElementById('projectVideoPreview').innerHTML = `
            <video controls style="max-width:200px;max-height:150px;border-radius:8px;">
                <source src="${project.video}">
            </video>
        `;
    }
    
    if (project.files && project.files.length > 0) {
        document.getElementById('projectFilesPreview').innerHTML = `
            <div style="padding:0.5rem 1rem;background:var(--bg-primary);border-radius:8px;border:1px solid var(--border-color);">
                <i class="fas fa-paperclip"></i> ${project.files.length} files attached
            </div>
        `;
    }
    
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('projectImages').addEventListener('change', function(e) {
    const preview = document.getElementById('projectImagesPreview');
    preview.innerHTML = '';
    if (this.files) {
        for (let i = 0; i < this.files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = document.createElement('img');
                img.src = ev.target.result;
                img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--accent-primary);';
                preview.appendChild(img);
            };
            reader.readAsDataURL(this.files[i]);
        }
    }
});

document.getElementById('projectVideo').addEventListener('change', function(e) {
    const preview = document.getElementById('projectVideoPreview');
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            preview.innerHTML = `
                <video controls style="max-width:200px;max-height:150px;border-radius:8px;">
                    <source src="${ev.target.result}">
                </video>
            `;
        };
        reader.readAsDataURL(this.files[0]);
    }
});

document.getElementById('projectFiles').addEventListener('change', function(e) {
    const preview = document.getElementById('projectFilesPreview');
    if (this.files && this.files.length > 0) {
        let html = '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">';
        for (let i = 0; i < this.files.length; i++) {
            html += `
                <div style="padding:0.3rem 0.8rem;background:var(--bg-primary);border-radius:8px;border:1px solid var(--border-color);font-size:0.85rem;">
                    <i class="fas fa-file"></i> ${this.files[i].name}
                </div>
            `;
        }
        html += '</div>';
        preview.innerHTML = html;
    }
});

document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let groupIndex = parseInt(document.getElementById('projectGroupId').value);
    const editIndex = parseInt(document.getElementById('projectEditIndex').value);
    
    if (isNaN(groupIndex) || groupIndex < 0) {
        const select = document.getElementById('projectGroupSelect');
        if (select && select.value !== '') {
            groupIndex = parseInt(select.value);
        }
    }
    
    if (isNaN(groupIndex) || !portfolioData.projectGroups[groupIndex]) {
        alert('❌ Please select a valid group first!');
        const select = document.getElementById('projectGroupSelect');
        if (select) select.focus();
        return;
    }
    
    const tech = document.getElementById('projectTech').value.split(',').map(t => t.trim()).filter(t => t);
    
    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        technologies: tech,
        github: document.getElementById('projectGithub').value,
        demo: document.getElementById('projectDemo').value,
        readme: document.getElementById('projectReadme').value,
        images: [],
        video: null,
        files: []
    };
    
    if (editIndex >= 0 && portfolioData.projectGroups[groupIndex].projects[editIndex]) {
        const existing = portfolioData.projectGroups[groupIndex].projects[editIndex];
        projectData.images = existing.images || [];
        projectData.video = existing.video;
        projectData.files = existing.files || [];
    }
    
    let uploads = 0;
    let totalUploads = 0;
    
    const imageFiles = document.getElementById('projectImages').files;
    if (imageFiles.length > 0) {
        totalUploads++;
        const imagePromises = [];
        for (let i = 0; i < imageFiles.length; i++) {
            imagePromises.push(new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(imageFiles[i]);
            }));
        }
        Promise.all(imagePromises).then(results => {
            projectData.images = results;
            uploads++;
            if (uploads === totalUploads) saveProject(projectData, groupIndex, editIndex);
        });
    }
    
    const videoFile = document.getElementById('projectVideo').files[0];
    if (videoFile) {
        totalUploads++;
        const reader = new FileReader();
        reader.onload = function(e) {
            projectData.video = e.target.result;
            uploads++;
            if (uploads === totalUploads) saveProject(projectData, groupIndex, editIndex);
        };
        reader.readAsDataURL(videoFile);
    }
    
    const fileInput = document.getElementById('projectFiles');
    if (fileInput.files.length > 0) {
        totalUploads++;
        const filePromises = [];
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            filePromises.push(new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            }));
        }
        Promise.all(filePromises).then(results => {
            projectData.files = results;
            uploads++;
            if (uploads === totalUploads) saveProject(projectData, groupIndex, editIndex);
        });
    }
    
    if (totalUploads === 0) {
        saveProject(projectData, groupIndex, editIndex);
    }
});

function saveProject(projectData, groupIndex, editIndex) {
    if (!portfolioData.projectGroups[groupIndex].projects) {
        portfolioData.projectGroups[groupIndex].projects = [];
    }
    
    if (editIndex >= 0 && editIndex < portfolioData.projectGroups[groupIndex].projects.length) {
        portfolioData.projectGroups[groupIndex].projects[editIndex] = projectData;
        alert('✅ Project updated successfully!');
    } else {
        portfolioData.projectGroups[groupIndex].projects.push(projectData);
        alert('✅ Project added successfully to "' + portfolioData.projectGroups[groupIndex].name + '"!');
    }
    
    saveData();
    renderGroupsAndProjects();
    hideAddProject();
    renderStats();
}

function deleteProject(groupIndex, projectIndex) {
    if (confirm('Delete this project?')) {
        portfolioData.projectGroups[parseInt(groupIndex)].projects.splice(parseInt(projectIndex), 1);
        saveData();
        renderGroupsAndProjects();
        renderStats();
    }
}

// ============================================
// EXPERIENCE
// ============================================

function renderExperience() {
    const list = document.getElementById('experienceList');
    const experiences = portfolioData.experience || [];
    
    if (experiences.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);">No experience yet.</p>';
        return;
    }
    
    list.innerHTML = experiences.map((exp, index) => `
        <div class="admin-item">
            <div class="item-info">
                <h4>${exp.role} at ${exp.company}</h4>
                <p>${exp.period}</p>
                <small style="color:var(--text-light);">${exp.description}</small>
            </div>
            <div class="item-actions">
                <button onclick="editExperience(${index})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteExperience(${index})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddExperience() {
    document.getElementById('addExperienceForm').style.display = 'block';
    document.getElementById('experienceFormTitle').textContent = 'Add Experience';
    document.getElementById('expSubmitBtn').textContent = 'Add Experience';
    document.getElementById('expEditIndex').value = '-1';
    document.getElementById('experienceForm').reset();
}

function hideAddExperience() {
    document.getElementById('addExperienceForm').style.display = 'none';
    document.getElementById('experienceForm').reset();
}

function editExperience(index) {
    const exp = portfolioData.experience[index];
    if (!exp) return;
    
    document.getElementById('addExperienceForm').style.display = 'block';
    document.getElementById('experienceFormTitle').textContent = 'Edit Experience';
    document.getElementById('expSubmitBtn').textContent = 'Update Experience';
    document.getElementById('expEditIndex').value = index;
    
    document.getElementById('expCompany').value = exp.company || '';
    document.getElementById('expRole').value = exp.role || '';
    document.getElementById('expPeriod').value = exp.period || '';
    document.getElementById('expDescription').value = exp.description || '';
}

document.getElementById('experienceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('expEditIndex').value);
    const exp = {
        company: document.getElementById('expCompany').value,
        role: document.getElementById('expRole').value,
        period: document.getElementById('expPeriod').value,
        description: document.getElementById('expDescription').value
    };
    
    if (editIndex >= 0) {
        portfolioData.experience[editIndex] = exp;
        alert('✅ Experience updated!');
    } else {
        portfolioData.experience.push(exp);
        alert('✅ Experience added!');
    }
    saveData();
    renderExperience();
    hideAddExperience();
    renderStats();
});

function deleteExperience(index) {
    if (confirm('Delete this experience?')) {
        portfolioData.experience.splice(index, 1);
        saveData();
        renderExperience();
        renderStats();
    }
}

// ============================================
// EDUCATION
// ============================================

function renderEducation() {
    const list = document.getElementById('educationList');
    const education = portfolioData.education || [];
    
    if (education.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);">No education added yet.</p>';
        return;
    }
    
    list.innerHTML = education.map((edu, index) => `
        <div class="admin-item">
            <div class="item-info">
                <h4>${edu.degree}</h4>
                <p style="font-weight:600;">${edu.institution}</p>
                ${edu.field ? `<p style="color:var(--text-secondary);">${edu.field}</p>` : ''}
                <p style="color:var(--text-light);font-size:0.85rem;">${edu.period || ''}</p>
                ${edu.description ? `<div style="color:var(--text-secondary);font-size:0.9rem;margin-top:0.5rem;white-space:pre-line;">${edu.description}</div>` : ''}
            </div>
            <div class="item-actions">
                <button onclick="editEducation(${index})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteEducation(${index})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddEducation() {
    document.getElementById('addEducationForm').style.display = 'block';
    document.getElementById('educationFormTitle').textContent = 'Add Education';
    document.getElementById('eduSubmitBtn').textContent = 'Add Education';
    document.getElementById('eduEditIndex').value = '-1';
    document.getElementById('educationForm').reset();
}

function hideAddEducation() {
    document.getElementById('addEducationForm').style.display = 'none';
    document.getElementById('educationForm').reset();
}

function editEducation(index) {
    const edu = portfolioData.education[index];
    if (!edu) return;
    
    document.getElementById('addEducationForm').style.display = 'block';
    document.getElementById('educationFormTitle').textContent = 'Edit Education';
    document.getElementById('eduSubmitBtn').textContent = 'Update Education';
    document.getElementById('eduEditIndex').value = index;
    
    document.getElementById('eduInstitution').value = edu.institution || '';
    document.getElementById('eduDegree').value = edu.degree || '';
    document.getElementById('eduField').value = edu.field || '';
    document.getElementById('eduPeriod').value = edu.period || '';
    document.getElementById('eduDescription').value = edu.description || '';
}

document.getElementById('educationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('eduEditIndex').value);
    const edu = {
        institution: document.getElementById('eduInstitution').value,
        degree: document.getElementById('eduDegree').value,
        field: document.getElementById('eduField').value,
        period: document.getElementById('eduPeriod').value,
        description: document.getElementById('eduDescription').value
    };
    
    if (editIndex >= 0) {
        portfolioData.education[editIndex] = edu;
        alert('✅ Education updated!');
    } else {
        portfolioData.education.push(edu);
        alert('✅ Education added!');
    }
    saveData();
    renderEducation();
    hideAddEducation();
    renderStats();
});

function deleteEducation(index) {
    if (confirm('Delete this education?')) {
        portfolioData.education.splice(index, 1);
        saveData();
        renderEducation();
        renderStats();
    }
}

// ============================================
// CERTIFICATIONS
// ============================================

function renderCertifications() {
    const list = document.getElementById('certificationsList');
    const certifications = portfolioData.certifications || [];
    
    if (certifications.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);">No certifications yet.</p>';
        return;
    }
    
    list.innerHTML = certifications.map((cert, index) => `
        <div class="admin-item">
            <div class="item-info">
                <div style="display:flex;gap:1rem;align-items:center;">
                    ${cert.file ? 
                        (cert.file.startsWith('data:image') ? 
                            `<img src="${cert.file}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">` :
                            `<div style="width:60px;height:60px;background:var(--bg-primary);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--accent-primary);">
                                <i class="fas fa-file-pdf"></i>
                            </div>`
                        ) : ''
                    }
                    <div>
                        <h4>${cert.name}</h4>
                        <p style="font-weight:600;">${cert.issuer}</p>
                        <p style="color:var(--text-light);font-size:0.85rem;">${cert.date || ''}</p>
                        ${cert.description ? `<div style="color:var(--text-secondary);font-size:0.9rem;margin-top:0.5rem;white-space:pre-line;">${cert.description}</div>` : ''}
                    </div>
                </div>
            </div>
            <div class="item-actions">
                <button onclick="editCertification(${index})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCertification(${index})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function showAddCertification() {
    document.getElementById('addCertificationForm').style.display = 'block';
    document.getElementById('certFormTitle').textContent = 'Add Certification';
    document.getElementById('certSubmitBtn').textContent = 'Add Certification';
    document.getElementById('certEditIndex').value = '-1';
    document.getElementById('certificationForm').reset();
    document.getElementById('certFilePreview').innerHTML = '';
}

function hideAddCertification() {
    document.getElementById('addCertificationForm').style.display = 'none';
    document.getElementById('certificationForm').reset();
    document.getElementById('certFilePreview').innerHTML = '';
}

function editCertification(index) {
    const cert = portfolioData.certifications[index];
    if (!cert) return;
    
    document.getElementById('addCertificationForm').style.display = 'block';
    document.getElementById('certFormTitle').textContent = 'Edit Certification';
    document.getElementById('certSubmitBtn').textContent = 'Update Certification';
    document.getElementById('certEditIndex').value = index;
    
    document.getElementById('certName').value = cert.name || '';
    document.getElementById('certIssuer').value = cert.issuer || '';
    document.getElementById('certDate').value = cert.date || '';
    document.getElementById('certDescription').value = cert.description || '';
    document.getElementById('certLink').value = cert.link || '';
    
    if (cert.file) {
        if (cert.file.startsWith('data:image')) {
            document.getElementById('certFilePreview').innerHTML = `
                <img src="${cert.file}" style="max-width:150px;max-height:150px;border-radius:8px;border:2px solid var(--accent-primary);">
            `;
        } else {
            document.getElementById('certFilePreview').innerHTML = `
                <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:var(--bg-primary);border-radius:8px;border:1px solid var(--border-color);">
                    <i class="fas fa-file-pdf" style="font-size:2rem;color:#ef4444;"></i>
                    <span>Current PDF</span>
                </div>
            `;
        }
    }
}

document.getElementById('certFile').addEventListener('change', function(e) {
    const preview = document.getElementById('certFilePreview');
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const reader = new FileReader();
        reader.onload = function(ev) {
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${ev.target.result}" style="max-width:150px;max-height:150px;border-radius:8px;border:2px solid var(--accent-primary);">`;
            } else {
                preview.innerHTML = `
                    <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:var(--bg-primary);border-radius:8px;border:1px solid var(--border-color);">
                        <i class="fas fa-file-pdf" style="font-size:2rem;color:#ef4444;"></i>
                        <span>${file.name}</span>
                    </div>
                `;
            }
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('certificationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('certEditIndex').value);
    const cert = {
        name: document.getElementById('certName').value,
        issuer: document.getElementById('certIssuer').value,
        date: document.getElementById('certDate').value,
        description: document.getElementById('certDescription').value,
        link: document.getElementById('certLink').value,
        file: null
    };
    
    if (editIndex >= 0 && portfolioData.certifications[editIndex]) {
        cert.file = portfolioData.certifications[editIndex].file;
    }
    
    const file = document.getElementById('certFile').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            cert.file = e.target.result;
            saveCertification(cert, editIndex);
        };
        reader.readAsDataURL(file);
    } else {
        saveCertification(cert, editIndex);
    }
});

function saveCertification(cert, editIndex) {
    if (editIndex >= 0) {
        portfolioData.certifications[editIndex] = cert;
        alert('✅ Certification updated!');
    } else {
        portfolioData.certifications.push(cert);
        alert('✅ Certification added!');
    }
    saveData();
    renderCertifications();
    hideAddCertification();
    renderStats();
}

function deleteCertification(index) {
    if (confirm('Delete this certification?')) {
        portfolioData.certifications.splice(index, 1);
        saveData();
        renderCertifications();
        renderStats();
    }
}

// ============================================
// SOCIAL LINKS
// ============================================

function renderSocialLinks() {
    const list = document.getElementById('socialList');
    const social = portfolioData.social || {};
    const links = Object.keys(social).map(key => ({
        platform: key,
        icon: getSocialIcon(key),
        url: social[key]
    }));
    
    if (links.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);">No social links yet.</p>';
        return;
    }
    
    list.innerHTML = links.map((link, index) => `
        <div class="admin-item">
            <div class="item-info">
                <h4><i class="${link.icon}"></i> ${link.platform}</h4>
                <p style="color:var(--text-light);">${link.url}</p>
            </div>
            <div class="item-actions">
                <button onclick="editSocialLink('${link.platform}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSocialLink('${link.platform}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function getSocialIcon(platform) {
    const icons = {
        github: 'fab fa-github',
        linkedin: 'fab fa-linkedin-in',
        twitter: 'fab fa-twitter',
        whatsapp: 'fab fa-whatsapp',
        email: 'fas fa-envelope',
        phone: 'fas fa-phone'
    };
    return icons[platform.toLowerCase()] || 'fas fa-link';
}

function showAddSocial() {
    document.getElementById('addSocialForm').style.display = 'block';
    document.getElementById('socialFormTitle').textContent = 'Add Social Link';
    document.getElementById('socialSubmitBtn').textContent = 'Add Link';
    document.getElementById('socialEditIndex').value = '-1';
    document.getElementById('socialForm').reset();
}

function hideAddSocial() {
    document.getElementById('addSocialForm').style.display = 'none';
    document.getElementById('socialForm').reset();
}

function editSocialLink(platform) {
    const social = portfolioData.social || {};
    const url = social[platform];
    if (!url) return;
    
    document.getElementById('addSocialForm').style.display = 'block';
    document.getElementById('socialFormTitle').textContent = 'Edit Social Link';
    document.getElementById('socialSubmitBtn').textContent = 'Update Link';
    document.getElementById('socialEditIndex').value = platform;
    
    document.getElementById('socialPlatform').value = platform.charAt(0).toUpperCase() + platform.slice(1);
    document.getElementById('socialIcon').value = getSocialIcon(platform);
    document.getElementById('socialUrl').value = url;
}

document.getElementById('socialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editPlatform = document.getElementById('socialEditIndex').value;
    let platform = document.getElementById('socialPlatform').value.toLowerCase().trim();
    const url = document.getElementById('socialUrl').value.trim();
    
    if (!platform) {
        alert('Please enter a platform name.');
        return;
    }
    
    if (!portfolioData.social) portfolioData.social = {};
    
    if (editPlatform && editPlatform !== '-1' && editPlatform !== platform) {
        delete portfolioData.social[editPlatform];
    }
    
    portfolioData.social[platform] = url;
    saveData();
    renderSocialLinks();
    hideAddSocial();
    renderStats();
    alert('✅ Social link saved!');
});

function deleteSocialLink(platform) {
    if (confirm('Delete this social link?')) {
        delete portfolioData.social[platform.toLowerCase()];
        saveData();
        renderSocialLinks();
        renderStats();
    }
}

// ============================================
// RESUME
// ============================================

function renderResumeInfo() {
    const resume = portfolioData.personal?.resume;
    if (resume) {
        document.getElementById('resumePreview').innerHTML = `
            <a href="${resume}" target="_blank" style="color:var(--accent-primary);">
                <i class="fas fa-file-pdf"></i> View Resume
            </a>
        `;
    }
}

document.getElementById('resumeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const file = document.getElementById('resumeFile').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            portfolioData.personal.resume = e.target.result;
            saveData();
            renderResumeInfo();
            alert('✅ Resume uploaded!');
        };
        reader.readAsDataURL(file);
    }
});

// ============================================
// VIDEOS
// ============================================

function renderVideoInfo() {
    const welcomeVideo = portfolioData.videos?.welcome;
    if (welcomeVideo) {
        document.getElementById('welcomeVideoPreview').innerHTML = `
            <video controls style="max-width:300px;max-height:200px;border-radius:8px;">
                <source src="${welcomeVideo}">
            </video>
        `;
    }
}

document.getElementById('welcomeVideoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const file = document.getElementById('welcomeVideo').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            portfolioData.videos.welcome = e.target.result;
            saveData();
            renderVideoInfo();
            alert('✅ Welcome video uploaded!');
        };
        reader.readAsDataURL(file);
    }
});

// ============================================
// MESSAGES
// ============================================

function renderMessages() {
    const list = document.getElementById('messagesList');
    const msgs = messages || [];
    
    if (msgs.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);">No messages yet.</p>';
        return;
    }
    
    list.innerHTML = msgs.map((msg, index) => `
        <div class="message-item">
            <div class="message-header">
                <span class="sender"><i class="fas fa-user"></i> ${msg.name}</span>
                <span class="date"><i class="fas fa-clock"></i> ${msg.date || 'Just now'}</span>
            </div>
            <div class="message-body">
                <p><strong>Email:</strong> ${msg.email}</p>
                <p><strong>Subject:</strong> ${msg.subject || 'No subject'}</p>
                <p>${msg.message}</p>
            </div>
            <button onclick="deleteMessage(${index})" class="btn-delete"><i class="fas fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

function deleteMessage(index) {
    if (confirm('Delete this message?')) {
        messages.splice(index, 1);
        saveMessages();
        renderMessages();
        renderStats();
    }
}

// ============================================
// SAVE FUNCTIONS
// ============================================

function saveData() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    console.log('✅ Data saved');
}

function saveMessages() {
    localStorage.setItem('messages', JSON.stringify(messages));
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// ============================================
// TAB SWITCHING
// ============================================

document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
    });
});

function switchTab(tab) {
    document.querySelectorAll('.sidebar-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

console.log('✅ admin.js loaded and ready!');