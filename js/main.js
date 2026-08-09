// ============================================
// MAIN.JS - Public View (Backend API Version)
// ============================================

console.log('✅ main.js loaded (API version)');

// ============================================
// CONFIGURATION
// ============================================

const API_BASE = 'https://portfolio-oqqu.onrender.com';

let portfolioData = {};
let currentGroup = null;
let currentProject = null;

// ============================================
// LOAD DATA FROM BACKEND
// ============================================

async function loadPublicData() {
    try {
        const response = await fetch(`${API_BASE}/api/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        portfolioData = await response.json();
        console.log('✅ Data loaded from backend');
        renderPublicPortfolio();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('hero-title').innerHTML = `Hi, I'm <span>Loading...</span>`;
        document.getElementById('projects-grid').innerHTML = `
            <p style="color:var(--text-secondary);text-align:center;width:100%;padding:2rem;">
                ⚠️ Unable to load portfolio data. Please try again later.
            </p>
        `;
    }
}

// ============================================
// RENDER PUBLIC PORTFOLIO
// ============================================

function renderPublicPortfolio() {
    const data = portfolioData;

    // Hero Section
    if (data.personal) {
        document.getElementById('hero-title').innerHTML = `Hi, I'm <span>${data.personal.name || 'Your Name'}</span>`;
        document.getElementById('hero-subtitle').textContent = data.personal.heroSubtitle || 'Web Developer';
        document.getElementById('hero-badge').textContent = data.personal.badge || '👋 Welcome';
        document.getElementById('logo').innerHTML = (data.personal.name || 'Dev').split(' ')[0] + '<span>.</span>';

        // PROFILE IMAGE
        const profileImg = document.getElementById('profile-img');
        if (profileImg) {
            if (data.personal.profileImage && data.personal.profileImage.startsWith('http')) {
                try {
                    profileImg.src = data.personal.profileImage;
                    profileImg.style.display = 'block';
                    console.log('✅ Profile image set successfully');
                } catch (e) {
                    console.warn('Failed to set profile image:', e);
                    profileImg.style.display = 'none';
                }
            } else {
                profileImg.style.display = 'none';
            }
        }

        // ABOUT IMAGE
        const aboutImg = document.getElementById('about-img');
        if (aboutImg) {
            if (data.personal.aboutImage && data.personal.aboutImage.startsWith('http')) {
                try {
                    aboutImg.src = data.personal.aboutImage;
                    aboutImg.style.display = 'block';
                    console.log('✅ About image set successfully');
                } catch (e) {
                    console.warn('Failed to set about image:', e);
                    aboutImg.style.display = 'none';
                }
            } else {
                aboutImg.style.display = 'none';
            }
        }

        if (data.personal.resume) {
            document.querySelectorAll('#resume-link, #resume-btn').forEach(link => {
                link.href = data.personal.resume;
                link.style.display = 'flex';
            });
        }
        if (data.personal.email) {
            document.getElementById('contact-email').textContent = data.personal.email;
            document.getElementById('contact-email').href = `mailto:${data.personal.email}`;
        }
    }

    // Stats
    const totalProjects = data.projectGroups?.reduce((sum, g) => sum + (g.projects?.length || 0), 0) || 0;
    document.getElementById('projects-count').textContent = totalProjects;
    document.getElementById('clients-count').textContent = data.projectGroups?.length || 0;
    document.getElementById('experience-count').textContent = data.experience?.length || 0;

    // About
    if (data.about && data.about.paragraphs) {
        const container = document.getElementById('about-text');
        container.innerHTML = '';
        data.about.paragraphs.forEach(p => {
            if (p && p.trim()) {
                const para = document.createElement('p');
                para.textContent = p;
                container.appendChild(para);
            }
        });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        const grid = document.getElementById('skills-grid');
        grid.innerHTML = '';
        data.skills.forEach(skill => {
            const div = document.createElement('div');
            div.className = 'skill-card';
            div.innerHTML = `
                <div class="skill-icon"><i class="${skill.icon || 'fas fa-code'}"></i></div>
                <h3>${skill.category}</h3>
                <div class="skill-tags">
                    ${skill.items ? skill.items.map(item => `<span class="skill-tag">${item}</span>`).join('') : ''}
                </div>
            `;
            grid.appendChild(div);
        });
    } else {
        const grid = document.getElementById('skills-grid');
        grid.innerHTML = `
            <div class="skill-card">
                <div class="skill-icon"><i class="fas fa-code"></i></div>
                <h3>Frontend Development</h3>
                <div class="skill-tags">
                    <span class="skill-tag">HTML</span>
                    <span class="skill-tag">CSS</span>
                    <span class="skill-tag">JavaScript</span>
                </div>
            </div>
            <div class="skill-card">
                <div class="skill-icon"><i class="fas fa-server"></i></div>
                <h3>Backend Development</h3>
                <div class="skill-tags">
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">Python</span>
                    <span class="skill-tag">SQL</span>
                </div>
            </div>
        `;
    }

    // Project Groups
    renderProjectGroups(data);

    // Experience
    if (data.experience) {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';
        data.experience.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <h3>${exp.role}</h3>
                <div class="company">${exp.company}</div>
                <div class="period">${exp.period}</div>
                <p>${exp.description}</p>
            `;
            timeline.appendChild(div);
        });
    }

    // Education
    if (data.education) {
        const grid = document.getElementById('education-list');
        grid.innerHTML = '';
        data.education.forEach(edu => {
            const div = document.createElement('div');
            div.className = 'education-card';
            div.innerHTML = `
                <div class="edu-icon"><i class="fas fa-graduation-cap"></i></div>
                <h3>${edu.institution}</h3>
                <div class="edu-degree">${edu.degree}</div>
                ${edu.field ? `<div class="edu-field">${edu.field}</div>` : ''}
                <div class="edu-period">${edu.period || ''}</div>
                ${edu.description ? `<div class="edu-description">${edu.description}</div>` : ''}
            `;
            grid.appendChild(div);
        });
    }

    // Certifications
    if (data.certifications) {
        const grid = document.getElementById('certifications-list');
        grid.innerHTML = '';
        data.certifications.forEach(cert => {
            const div = document.createElement('div');
            div.className = 'certification-card';
            div.innerHTML = `
                <div class="cert-icon"><i class="fas fa-certificate"></i></div>
                <h3>${cert.name}</h3>
                <div class="cert-issuer">${cert.issuer}</div>
                <div class="cert-date">${cert.date || ''}</div>
                ${cert.description ? `<div class="cert-description">${cert.description}</div>` : ''}
                ${cert.file ? `<a href="${cert.file}" download class="btn-view"><i class="fas fa-download"></i> Download</a>` : ''}
            `;
            grid.appendChild(div);
        });
    }

    // Social Links
    renderSocialLinks(data);

    // Footer
    if (data.footer) {
        document.getElementById('footer-text').innerHTML = data.footer;
    }
}

// ============================================
// RENDER PROJECT GROUPS
// ============================================

function renderProjectGroups(data) {
    const container = document.getElementById('projects-grid');
    const groups = data.projectGroups || [];

    if (groups.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:3rem;width:100%;">
                <i class="fas fa-folder-open" style="font-size:4rem;color:var(--text-light);margin-bottom:1rem;"></i>
                <p style="color:var(--text-secondary);">No projects added yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = groups.map((group, index) => {
        const groupId = group.id || index;
        return `
        <div class="project-card group-card" onclick="showGroup('${groupId}')" style="cursor:pointer;">
            <div class="project-image" style="display:flex;align-items:center;justify-content:center;background:var(--accent-gradient);min-height:200px;">
                <i class="${group.icon || 'fas fa-folder'}" style="font-size:4rem;color:white;opacity:0.9;"></i>
            </div>
            <div class="project-content">
                <span class="project-tag">${group.projects?.length || 0} Projects</span>
                <h3>${group.name}</h3>
                <p>${group.description || 'Click to view projects in this category'}</p>
                <div style="margin-top:1rem;color:var(--accent-primary);font-weight:600;">
                    View Projects <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        </div>
    `}).join('');
}

// ============================================
// SHOW GROUP
// ============================================

function showGroup(groupId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;

    currentGroup = groupId;
    const container = document.getElementById('projects-grid');
    const projects = group.projects || [];

    if (projects.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:3rem;width:100%;grid-column:1/-1;">
                <p style="color:var(--text-secondary);">No projects in this group yet.</p>
                <button onclick="showGroups()" class="btn secondary" style="margin-top:1rem;">
                    <i class="fas fa-arrow-left"></i> Back to Groups
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;margin-bottom:2rem;">
            <button onclick="showGroups()" class="btn secondary" style="margin-bottom:1rem;">
                <i class="fas fa-arrow-left"></i> Back to Groups
            </button>
            <h2 style="font-size:2.5rem;font-weight:800;">
                <i class="${group.icon || 'fas fa-folder'}" style="color:var(--accent-primary);"></i>
                ${group.name}
            </h2>
            <p style="color:var(--text-secondary);">${group.description || ''}</p>
        </div>
        ${projects.map((project, pIndex) => {
            const projectId = project.id || pIndex;
            return `
            <div class="project-card" onclick="showProjectDetail('${groupId}', '${projectId}')" style="cursor:pointer;">
                <div class="project-image">
                    ${project.images && project.images.length > 0 ? 
                        `<img src="${project.images[0]}" alt="${project.title}">` :
                        `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-gradient);">
                            <i class="fas fa-code" style="font-size:3rem;color:var(--accent-primary);"></i>
                        </div>`
                    }
                </div>
                <div class="project-content">
                    <span class="project-tag">${project.technologies?.length || 0} Technologies</span>
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;">
                        ${project.technologies ? project.technologies.map(tech => 
                            `<span style="background:var(--bg-primary);padding:0.2rem 0.6rem;border-radius:50px;font-size:0.75rem;color:var(--text-secondary);">${tech}</span>`
                        ).join('') : ''}
                    </div>
                    <div style="margin-top:1rem;color:var(--accent-primary);font-weight:600;font-size:0.9rem;">
                        Click to view details <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `}).join('')}
    `;

    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// SHOW PROJECT DETAIL
// ============================================

function showProjectDetail(groupId, projectId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;

    const project = group.projects.find(p => p.id == projectId);
    if (!project) return;

    currentProject = projectId;
    const container = document.getElementById('projects-grid');

    // Images gallery
    let imagesHtml = '';
    if (project.images && project.images.length > 0) {
        imagesHtml = `
            <div style="grid-column:1/-1;">
                <h3 style="margin-bottom:1rem;"><i class="fas fa-images"></i> Project Gallery (${project.images.length})</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
                    ${project.images.map(img => `
                        <img src="${img}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm);cursor:pointer;" onclick="openLightbox('${img}')">
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Videos
    let videoHtml = '';
    const videos = project.videos || [];
    if (videos.length > 0) {
        videoHtml = `
            <div style="grid-column:1/-1;">
                <h3 style="margin-bottom:1rem;"><i class="fas fa-video"></i> Project Videos (${videos.length})</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
                    ${videos.map(vid => `
                        <video controls style="width:100%;border-radius:16px;box-shadow:var(--shadow-md);background:#000;">
                            <source src="${vid}">
                            Your browser does not support the video tag.
                        </video>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // README
    let readmeHtml = '';
    if (project.readme) {
        const readmeHTML = marked.parse(project.readme);
        readmeHtml = `
            <div style="grid-column:1/-1;background:var(--bg-card);padding:2rem;border-radius:16px;border:1px solid var(--border-color);">
                <h3 style="margin-bottom:1rem;"><i class="fas fa-book"></i> Documentation / README</h3>
                <div class="markdown-body" style="color:var(--text-secondary);line-height:1.8;background:transparent;padding:0;">
                    ${readmeHTML}
                </div>
            </div>
        `;
    }

    // Attached files
    let filesHtml = '';
    if (project.files && project.files.length > 0) {
        filesHtml = `
            <div style="grid-column:1/-1;">
                <h3 style="margin-bottom:1rem;"><i class="fas fa-paperclip"></i> Attached Files (${project.files.length})</h3>
                <div style="display:flex;flex-wrap:wrap;gap:1rem;">
                    ${project.files.map(file => `
                        <a href="${file.data}" download="${file.name}" style="display:flex;align-items:center;gap:0.5rem;padding:0.8rem 1.2rem;background:var(--bg-primary);border-radius:12px;border:1px solid var(--border-color);text-decoration:none;color:var(--text-primary);transition:var(--transition);">
                            <i class="fas fa-${file.type?.includes('pdf') ? 'file-pdf' : file.type?.includes('zip') ? 'file-archive' : 'file'}" style="color:var(--accent-primary);"></i>
                            ${file.name}
                            <span style="font-size:0.8rem;color:var(--text-light);">(${(file.size / 1024).toFixed(1)} KB)</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // GitHub & Demo links
    let linksHtml = '';
    if (project.github || project.demo) {
        linksHtml = `
            <div style="grid-column:1/-1;display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">
                ${project.github ? `
                    <a href="${project.github}" target="_blank" class="btn-github" style="background:#24292e;color:white;display:inline-flex;align-items:center;gap:0.6rem;padding:0.9rem 2.2rem;border-radius:50px;text-decoration:none;font-weight:600;transition:all 0.3s;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(36,41,46,0.3);">
                        <i class="fab fa-github" style="font-size:1.2rem;"></i> View on GitHub
                    </a>
                ` : ''}
                ${project.demo ? `
                    <a href="${project.demo}" target="_blank" class="btn primary" style="display:inline-flex;align-items:center;gap:0.6rem;padding:0.9rem 2.2rem;border-radius:50px;text-decoration:none;font-weight:600;transition:all 0.3s;border:none;cursor:pointer;background:var(--accent-gradient);color:white;box-shadow:0 4px 20px rgba(99,102,241,0.3);">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                ` : ''}
            </div>
        `;
    }

    container.innerHTML = `
        <div style="grid-column:1/-1;">
            <button onclick="showGroup('${groupId}')" class="btn secondary" style="margin-bottom:2rem;">
                <i class="fas fa-arrow-left"></i> Back to ${group.name}
            </button>
        </div>

        <div style="grid-column:1/-1;background:var(--bg-card);padding:2.5rem;border-radius:16px;border:1px solid var(--border-color);">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start;">
                <div>
                    ${project.images && project.images.length > 0 ? 
                        `<img src="${project.images[0]}" style="width:100%;border-radius:12px;box-shadow:var(--shadow-md);">` :
                        `<div style="width:100%;height:300px;background:var(--bg-gradient);border-radius:12px;display:flex;align-items:center;justify-content:center;">
                            <i class="fas fa-code" style="font-size:4rem;color:var(--accent-primary);"></i>
                        </div>`
                    }
                </div>
                <div>
                    <span class="project-tag" style="background:var(--accent-gradient);color:white;padding:0.3rem 1rem;border-radius:50px;font-size:0.8rem;">
                        ${group.name}
                    </span>
                    <h1 style="font-size:2.5rem;font-weight:800;margin:1rem 0 0.5rem;">${project.title}</h1>
                    <p style="color:var(--text-secondary);font-size:1.1rem;line-height:1.8;">${project.description}</p>

                    ${project.technologies ? `
                        <div style="margin-top:1.5rem;">
                            <h4 style="margin-bottom:0.5rem;">Technologies</h4>
                            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
                                ${project.technologies.map(tech => 
                                    `<span style="background:var(--bg-primary);padding:0.3rem 1rem;border-radius:50px;font-size:0.9rem;border:1px solid var(--border-color);">${tech}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${linksHtml}
                </div>
            </div>
        </div>

        ${imagesHtml}
        ${videoHtml}
        ${readmeHtml}
        ${filesHtml}
    `;

    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// SHOW GROUPS
// ============================================

function showGroups() {
    currentGroup = null;
    currentProject = null;
    renderProjectGroups(portfolioData);
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// LIGHTBOX
// ============================================

function openLightbox(imageSrc) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 2rem;
        cursor: pointer;
    `;
    modal.innerHTML = `
        <img src="${imageSrc}" style="max-width:90%;max-height:90%;border-radius:12px;object-fit:contain;">
        <button onclick="this.parentElement.remove()" style="position:absolute;top:20px;right:30px;background:none;border:none;color:white;font-size:2.5rem;cursor:pointer;">&times;</button>
    `;
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
    document.body.appendChild(modal);
}

// ============================================
// SOCIAL LINKS
// ============================================

function renderSocialLinks(data) {
    const container = document.getElementById('social-links');
    if (!container) return;

    container.innerHTML = '';
    const social = data.social || {};
    const personal = data.personal || {};

    const links = [
        { key: 'whatsapp', icon: 'fab fa-whatsapp', label: 'WhatsApp', url: social.whatsapp ? `https://wa.me/${social.whatsapp.replace(/\D/g, '')}` : null },
        { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn', url: social.linkedin },
        { key: 'github', icon: 'fab fa-github', label: 'GitHub', url: social.github },
        { key: 'twitter', icon: 'fab fa-twitter', label: 'Twitter', url: social.twitter },
        { key: 'phone', icon: 'fas fa-phone', label: 'Phone', url: social.phone ? `tel:${social.phone.replace(/\s/g, '')}` : personal.phone ? `tel:${personal.phone.replace(/\s/g, '')}` : null },
        { key: 'email', icon: 'fas fa-envelope', label: 'Email', url: personal.email ? `mailto:${personal.email}` : null }
    ];

    links.forEach(link => {
        if (link.url) {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.className = `social-icon ${link.key}`;
            a.title = link.label;
            a.innerHTML = `<i class="${link.icon}"></i><span>${link.label}</span>`;
            container.appendChild(a);
        }
    });
}

// ============================================
// CONTACT FORM
// ============================================

document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const subject = document.getElementById('form-subject')?.value || 'No subject';
    const message = document.getElementById('form-message').value;

    const msgData = { name, email, subject, message };

    const btn = this.querySelector('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgData)
        });

        if (!response.ok) throw new Error('Failed to send message');

        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            btn.style.background = '';
            btn.disabled = false;
            this.reset();
        }, 3000);
    } catch (error) {
        console.error('Error sending message:', error);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to send';
        btn.style.background = '#ef4444';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    }
});

// ============================================
// THEME TOGGLE
// ============================================

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        themeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.querySelector('i').className = 'fas fa-sun';
}

// ============================================
// MOBILE MENU
// ============================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadPublicData();
});

console.log('✅ main.js loaded and ready!');