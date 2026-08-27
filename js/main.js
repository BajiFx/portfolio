// ============================================
// MAIN.JS - Public View
// ============================================

console.log('✅ main.js loaded (API version)');

const API_BASE = 'https://portfolio-cms-k2at.onrender.com';
let portfolioData = {};
let currentGroup = null;
let currentProject = null;

// Chat state
let visitorToken = localStorage.getItem('visitorToken');
let currentConversationId = null;
let chatPollInterval = null;
let authMode = 'login';

// ============================================
// LOAD PUBLIC DATA
// ============================================

async function loadPublicData() {
    console.log('🔍 Starting to load data...');
    console.log('API_BASE:', API_BASE);
    
    try {
        const response = await fetch(`${API_BASE}/api/data`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            console.error('Error status:', response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        portfolioData = await response.json();
        console.log('✅ Data loaded successfully');
        
        // Check if we have data
        if (!portfolioData.personal) {
            console.warn('No personal data found');
        }
        
        renderPublicPortfolio();
        initContactModes();
        initChat();
        initAuthModal();
    } catch (error) {
        console.error('❌ Error loading data:', error);
        
        // Show error message on page
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `Hi, I'm <span>Error Loading</span>`;
        }
        
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <p style="color:var(--text-secondary);text-align:center;width:100%;padding:2rem;">
                    ❌ Error loading data: ${error.message}
                </p>
            `;
        }
    }
}

// ============================================
// RENDER PUBLIC PORTFOLIO
// ============================================

function renderPublicPortfolio() {
    console.log('Rendering portfolio...');
    const data = portfolioData;

    // --- Hero Section ---
    if (data.personal) {
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `Hi, I'm <span>${data.personal.name || 'Your Name'}</span>`;
        }
        
        const heroSubtitle = document.getElementById('hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = data.personal.heroSubtitle || 'Web Developer';
        }
        
        const heroBadge = document.getElementById('hero-badge');
        if (heroBadge) {
            heroBadge.textContent = data.personal.badge || '👋 Welcome';
        }
        
        const logo = document.getElementById('logo');
        if (logo) {
            logo.innerHTML = (data.personal.name || 'Dev').split(' ')[0] + '<span>.</span>';
        }
        
        // Profile image
        const profileImg = document.getElementById('profile-img');
        if (profileImg && data.personal.profileImage) {
            profileImg.src = data.personal.profileImage;
            profileImg.style.display = 'block';
        } else if (profileImg) {
            profileImg.style.display = 'none';
        }
        
        // About image
        const aboutImg = document.getElementById('about-img');
        if (aboutImg && data.personal.aboutImage) {
            aboutImg.src = data.personal.aboutImage;
            aboutImg.style.display = 'block';
        } else if (aboutImg) {
            aboutImg.style.display = 'none';
        }
        
        // Resume link
        if (data.personal.resume) {
            document.querySelectorAll('#resume-link, #resume-btn').forEach(link => {
                if (link) {
                    link.href = data.personal.resume;
                    link.style.display = 'flex';
                }
            });
        }
        
        // Contact email
        const contactEmail = document.getElementById('contact-email');
        if (contactEmail && data.personal.email) {
            contactEmail.textContent = data.personal.email;
            contactEmail.href = `mailto:${data.personal.email}`;
        }
    }

    // --- Stats ---
    const totalProjects = portfolioData.projectGroups?.reduce((sum, g) => sum + (g.projects?.length || 0), 0) || 0;
    
    const projectsCount = document.getElementById('projects-count');
    if (projectsCount) projectsCount.textContent = totalProjects;
    
    const clientsCount = document.getElementById('clients-count');
    if (clientsCount) clientsCount.textContent = portfolioData.projectGroups?.length || 0;
    
    const experienceCount = document.getElementById('experience-count');
    if (experienceCount) experienceCount.textContent = portfolioData.experience?.length || 0;

    // --- About Section ---
    if (data.about && data.about.paragraphs) {
        const container = document.getElementById('about-text');
        if (container) {
            container.innerHTML = '';
            data.about.paragraphs.forEach(p => {
                if (p && p.trim()) {
                    const para = document.createElement('p');
                    para.textContent = p;
                    container.appendChild(para);
                }
            });
        }
    }

    // --- Skills Section ---
    renderSkills(data);

    // --- Projects Section ---
    renderProjectGroups(data);

    // --- Experience Section ---
    renderExperience(data);

    // --- Education Section ---
    renderEducation(data);

    // --- Certifications Section ---
    renderCertifications(data);

    // --- Social Links ---
    renderSocialLinks(data);

    // --- Footer ---
    if (data.footer) {
        const footerText = document.getElementById('footer-text');
        if (footerText) footerText.innerHTML = data.footer;
    }
}

// ============================================
// RENDER SKILLS
// ============================================

function renderSkills(data) {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    if (data.skills && data.skills.length > 0) {
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
        grid.innerHTML = `
            <div class="skill-card">
                <div class="skill-icon"><i class="fas fa-code"></i></div>
                <h3>Frontend</h3>
                <div class="skill-tags">
                    <span class="skill-tag">HTML</span>
                    <span class="skill-tag">CSS</span>
                    <span class="skill-tag">JS</span>
                </div>
            </div>
            <div class="skill-card">
                <div class="skill-icon"><i class="fas fa-server"></i></div>
                <h3>Backend</h3>
                <div class="skill-tags">
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">Python</span>
                    <span class="skill-tag">SQL</span>
                </div>
            </div>
        `;
    }
}

// ============================================
// RENDER PROJECT GROUPS
// ============================================

function renderProjectGroups(data) {
    const container = document.getElementById('projects-grid');
    if (!container) return;

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
// RENDER EXPERIENCE
// ============================================

function renderExperience(data) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    if (data.experience && data.experience.length > 0) {
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
    } else {
        timeline.innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-secondary);">
                No experience added yet.
            </div>
        `;
    }
}

// ============================================
// RENDER EDUCATION
// ============================================

function renderEducation(data) {
    const grid = document.getElementById('education-list');
    if (!grid) return;

    if (data.education && data.education.length > 0) {
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
    } else {
        grid.innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-secondary);">
                No education added yet.
            </div>
        `;
    }
}

// ============================================
// RENDER CERTIFICATIONS
// ============================================

function renderCertifications(data) {
    const grid = document.getElementById('certifications-list');
    if (!grid) return;

    if (data.certifications && data.certifications.length > 0) {
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
                ${cert.link ? `<a href="${cert.link}" target="_blank" class="btn-verify"><i class="fas fa-external-link-alt"></i> Verify</a>` : ''}
            `;
            grid.appendChild(div);
        });
    } else {
        grid.innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-secondary);">
                No certifications added yet.
            </div>
        `;
    }
}

// ============================================
// RENDER SOCIAL LINKS
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
// SHOW GROUP / PROJECT DETAIL
// ============================================

function showGroup(groupId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;

    currentGroup = groupId;
    const container = document.getElementById('projects-grid');
    if (!container) return;
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
                    <div style="margin-top:1rem;color:var(--accent-primary);font-weight:600;font-size:0.9rem;">
                        Click to view details <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `}).join('')}
    `;

    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

function showGroups() {
    currentGroup = null;
    currentProject = null;
    renderProjectGroups(portfolioData);
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

function showProjectDetail(groupId, projectId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;

    const project = group.projects.find(p => p.id == projectId);
    if (!project) return;

    currentProject = projectId;
    const container = document.getElementById('projects-grid');
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column:1/-1;">
            <button onclick="showGroup('${groupId}')" class="btn secondary" style="margin-bottom:2rem;">
                <i class="fas fa-arrow-left"></i> Back to ${group.name}
            </button>
        </div>
        <div style="grid-column:1/-1;background:var(--bg-card);padding:2.5rem;border-radius:16px;border:1px solid var(--border-color);">
            <h1 style="font-size:2.5rem;font-weight:800;margin-bottom:0.5rem;">${project.title}</h1>
            <p style="color:var(--text-secondary);font-size:1.1rem;line-height:1.8;">${project.description}</p>
            ${project.technologies ? `
                <div style="margin-top:1.5rem;">
                    <h4 style="margin-bottom:0.5rem;">Technologies</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
                        ${project.technologies.map(tech => `<span style="background:var(--bg-primary);padding:0.3rem 1rem;border-radius:50px;font-size:0.9rem;border:1px solid var(--border-color);">${tech}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${project.github || project.demo ? `
                <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.5rem;">
                    ${project.github ? `<a href="${project.github}" target="_blank" class="btn-github"><i class="fab fa-github"></i> View on GitHub</a>` : ''}
                    ${project.demo ? `<a href="${project.demo}" target="_blank" class="btn primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// CONTACT MODES
// ============================================

function initContactModes() {
    const modeButtons = document.querySelectorAll('.contact-mode button');
    if (modeButtons.length === 0) return;

    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const mode = this.dataset.mode;
            document.getElementById('out-conversation').style.display = mode === 'out' ? 'block' : 'none';
            document.getElementById('in-conversation').style.display = mode === 'in' ? 'block' : 'none';
        });
    });

    // Channel selection
    const channelButtons = document.querySelectorAll('.channel-select button');
    if (channelButtons.length > 0) {
        channelButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                channelButtons.forEach(b => b.classList.remove('active-channel'));
                this.classList.add('active-channel');
            });
        });
    }

    // Out form submit
    const outForm = document.getElementById('out-form');
    if (outForm) {
        outForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('out-name').value.trim();
            const email = document.getElementById('out-email').value.trim();
            const message = document.getElementById('out-message').value.trim();
            const activeChannel = document.querySelector('.channel-select button.active-channel');
            const channel = activeChannel ? activeChannel.dataset.channel : 'email';

            try {
                const response = await fetch(`${API_BASE}/api/contact-out`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message, channel })
                });
                const data = await response.json();
                if (data.success) {
                    alert('✅ Message sent successfully!');
                    outForm.reset();
                } else {
                    alert('❌ Failed to send message: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('❌ Network error. Please try again.');
            }
        });
    }
}

// ============================================
// CHAT FUNCTIONALITY
// ============================================

function initChat() {
    const chatLoginLink = document.getElementById('chat-login-link');
    const chatRegisterLink = document.getElementById('chat-register-link');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');

    if (chatLoginLink) {
        chatLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('login');
        });
    }

    if (chatRegisterLink) {
        chatRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('register');
        });
    }

    if (chatSend) {
        chatSend.addEventListener('click', sendChatMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    // Check if already logged in
    if (visitorToken) {
        loadConversation();
    }
}

// ============================================
// THEME, MOBILE, SMOOTH SCROLL
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

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        if (navLinks) navLinks.classList.toggle('active');
    });
}
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
    });
});

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
// AUTH MODAL
// ============================================

function initAuthModal() {
    const closeBtn = document.getElementById('closeAuthModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('authModal').classList.remove('active');
        });
    }
}

function openAuthModal(mode) {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    authMode = mode;
    modal.classList.add('active');
    document.getElementById('authModalTitle').textContent = mode === 'login' ? 'Login' : 'Register';
    document.getElementById('authModalSub').textContent = mode === 'login' ? 'Enter your credentials' : 'Create an account';
    document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'Login' : 'Register';
    document.getElementById('confirmPasswordGroup').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authSwitchText').innerHTML = mode === 'login' 
        ? `Don't have an account? <a id="authSwitchLink">Register</a>`
        : `Already have an account? <a id="authSwitchLink">Login</a>`;

    const switchLink = document.getElementById('authSwitchLink');
    if (switchLink) {
        switchLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal(authMode === 'login' ? 'register' : 'login');
        });
    }
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.querySelector('i').className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
}

// ============================================
// CHAT MESSAGES
// ============================================

function loadConversation() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:1rem;">Loading conversation...</p>';

    fetch(`${API_BASE}/api/chat`, {
        headers: { 'Authorization': `Bearer ${visitorToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentConversationId = data.conversationId;
            renderChatMessages(data.messages);
            // Enable input
            document.getElementById('chat-input').disabled = false;
            document.getElementById('chat-send').disabled = false;
        }
    })
    .catch(err => {
        console.error('Error loading conversation:', err);
        chatMessages.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:1rem;">Please login to chat</p>';
    });
}

function renderChatMessages(messages) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    if (!messages || messages.length === 0) {
        chatMessages.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:1rem;">No messages yet</p>';
        return;
    }

    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `chat-message ${msg.sender_type === 'visitor' ? 'visitor' : 'admin'}`;
        div.textContent = msg.message;
        chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${visitorToken}`
        },
        body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            input.value = '';
            loadConversation();
        }
    })
    .catch(err => {
        console.error('Error sending message:', err);
        alert('Failed to send message.');
    });
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', loadPublicData);
console.log('✅ main.js loaded and ready!');