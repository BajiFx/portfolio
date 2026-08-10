// ============================================
// MAIN.JS - Public View (with Contact Modes & Chat)
// ============================================

console.log('✅ main.js loaded (API version)');

const API_BASE = 'https://portfolio-oqqu.onrender.com';
let portfolioData = {};
let currentGroup = null;
let currentProject = null;

// Chat state
let visitorToken = localStorage.getItem('visitorToken');
let currentConversationId = null;
let chatPollInterval = null;

// Auth modal state
let authMode = 'login'; // 'login' or 'register'

// ============================================
// LOAD PUBLIC DATA
// ============================================

async function loadPublicData() {
    try {
        const response = await fetch(`${API_BASE}/api/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        portfolioData = await response.json();
        console.log('✅ Data loaded from backend');
        renderPublicPortfolio();
        initContactModes();
        initChat();
        initAuthModal();
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
// RENDER PUBLIC PORTFOLIO (safe with null checks)
// ============================================

function renderPublicPortfolio() {
    const data = portfolioData;

    // Helper: safe innerHTML setter
    function setInnerHTML(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    // --- Hero ---
    if (data.personal) {
        setInnerHTML('hero-title', `Hi, I'm <span>${data.personal.name || 'Your Name'}</span>`);
        setInnerHTML('hero-subtitle', data.personal.heroSubtitle || 'Web Developer');
        setInnerHTML('hero-badge', data.personal.badge || '👋 Welcome');
        setInnerHTML('logo', (data.personal.name || 'Dev').split(' ')[0] + '<span>.</span>');

        // Profile image
        const profileImg = document.getElementById('profile-img');
        if (profileImg) {
            if (data.personal.profileImage && data.personal.profileImage.startsWith('http')) {
                profileImg.src = data.personal.profileImage;
                profileImg.style.display = 'block';
            } else {
                profileImg.style.display = 'none';
            }
        }

        // About image
        const aboutImg = document.getElementById('about-img');
        if (aboutImg) {
            if (data.personal.aboutImage && data.personal.aboutImage.startsWith('http')) {
                aboutImg.src = data.personal.aboutImage;
                aboutImg.style.display = 'block';
            } else {
                aboutImg.style.display = 'none';
            }
        }

        // Resume
        if (data.personal.resume) {
            document.querySelectorAll('#resume-link, #resume-btn').forEach(link => {
                if (link) {
                    link.href = data.personal.resume;
                    link.style.display = 'flex';
                }
            });
        }

        // Email
        const contactEmail = document.getElementById('contact-email');
        if (contactEmail && data.personal.email) {
            contactEmail.textContent = data.personal.email;
            contactEmail.href = `mailto:${data.personal.email}`;
        }
    }

    // --- Stats ---
    const totalProjects = portfolioData.projectGroups?.reduce((sum, g) => sum + (g.projects?.length || 0), 0) || 0;
    setInnerHTML('projects-count', totalProjects);
    setInnerHTML('clients-count', portfolioData.projectGroups?.length || 0);
    setInnerHTML('experience-count', portfolioData.experience?.length || 0);

    // --- About ---
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

    // --- Skills ---
    if (data.skills && data.skills.length > 0) {
        const grid = document.getElementById('skills-grid');
        if (grid) {
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
        }
    } else {
        const grid = document.getElementById('skills-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="skill-card"><div class="skill-icon"><i class="fas fa-code"></i></div><h3>Frontend</h3><div class="skill-tags"><span class="skill-tag">HTML</span><span class="skill-tag">CSS</span><span class="skill-tag">JS</span></div></div>
                <div class="skill-card"><div class="skill-icon"><i class="fas fa-server"></i></div><h3>Backend</h3><div class="skill-tags"><span class="skill-tag">Node.js</span><span class="skill-tag">Python</span><span class="skill-tag">SQL</span></div></div>
            `;
        }
    }

    // --- Project Groups ---
    renderProjectGroups(data);

    // --- Experience ---
    if (data.experience) {
        const timeline = document.getElementById('timeline');
        if (timeline) {
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
    }

    // --- Education ---
    if (data.education) {
        const grid = document.getElementById('education-list');
        if (grid) {
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
    }

    // --- Certifications ---
    if (data.certifications) {
        const grid = document.getElementById('certifications-list');
        if (grid) {
            grid.innerHTML = '';
            data.certifications.forEach(cert => {
                const div = document.createElement('div');
                div.className = 'certification-card';
                let fileHtml = '';
                if (cert.file) {
                    if (cert.file.startsWith('data:image') || cert.file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        fileHtml = `<div class="cert-file-preview"><img src="${cert.file}" alt="Certificate"></div>`;
                    } else {
                        fileHtml = `<div class="cert-file-preview"><a href="${cert.file}" download>📄 Download Certificate</a></div>`;
                    }
                }
                div.innerHTML = `
                    <div class="cert-icon"><i class="fas fa-certificate"></i></div>
                    <h3>${cert.name}</h3>
                    <div class="cert-issuer">${cert.issuer}</div>
                    <div class="cert-date">${cert.date || ''}</div>
                    ${cert.description ? `<div class="cert-description">${cert.description}</div>` : ''}
                    ${fileHtml}
                    <div class="cert-actions">
                        ${cert.file ? `<a href="${cert.file}" download class="btn-view"><i class="fas fa-download"></i> Download</a>` : ''}
                        ${cert.link ? `<a href="${cert.link}" target="_blank" class="btn-verify"><i class="fas fa-external-link-alt"></i> Verify</a>` : ''}
                    </div>
                `;
                grid.appendChild(div);
            });
        }
    }

    // --- Social Links ---
    renderSocialLinks(data);

    // --- Footer ---
    if (data.footer) {
        setInnerHTML('footer-text', data.footer);
    }
}

// ============================================
// PROJECT GROUPS & DETAILS (keep your existing – I'll include placeholders)
// ============================================

function renderProjectGroups(data) {
    const container = document.getElementById('projects-grid');
    const groups = data.projectGroups || [];
    if (!container) return;

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

function showProjectDetail(groupId, projectId) {
    const group = portfolioData.projectGroups.find(g => g.id == groupId);
    if (!group) return;

    const project = group.projects.find(p => p.id == projectId);
    if (!project) return;

    currentProject = projectId;
    const container = document.getElementById('projects-grid');
    if (!container) return;

    // (Keep your existing detailed view – I'll provide a simplified version here, but you should keep your full one)
    container.innerHTML = `
        <div style="grid-column:1/-1;">
            <button onclick="showGroup('${groupId}')" class="btn secondary" style="margin-bottom:2rem;">
                <i class="fas fa-arrow-left"></i> Back to ${group.name}
            </button>
        </div>
        <div style="grid-column:1/-1;background:var(--bg-card);padding:2.5rem;border-radius:16px;border:1px solid var(--border-color);">
            <h1>${project.title}</h1>
            <p>${project.description}</p>
            <!-- Add more details as needed -->
        </div>
    `;
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

function showGroups() {
    currentGroup = null;
    currentProject = null;
    renderProjectGroups(portfolioData);
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

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
// CONTACT MODES
// ============================================

function initContactModes() {
    console.log('🔧 initContactModes called');

    const modeBtns = document.querySelectorAll('.contact-mode button');
    const outDiv = document.getElementById('out-conversation');
    const inDiv = document.getElementById('in-conversation');

    if (!modeBtns.length) {
        console.warn('No contact mode buttons found.');
        return;
    }

    modeBtns.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.addEventListener('click', function(e) {
            console.log(`🔘 Clicked mode: ${this.dataset.mode}`);
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (this.dataset.mode === 'out') {
                outDiv.style.display = 'block';
                inDiv.style.display = 'none';
            } else {
                outDiv.style.display = 'none';
                inDiv.style.display = 'block';
                if (visitorToken) {
                    loadConversation();
                } else {
                    document.getElementById('chat-messages').innerHTML = `<p style="color:var(--text-light);text-align:center;width:100%;padding:1rem;">Please login or register to start chatting.</p>`;
                }
            }
        });
    });

    // Channel selection
    const channelBtns = document.querySelectorAll('.channel-select button');
    channelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            channelBtns.forEach(b => b.classList.remove('active-channel'));
            this.classList.add('active-channel');
        });
    });

    // Out form
    document.getElementById('out-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('out-name').value.trim();
        const email = document.getElementById('out-email').value.trim();
        const message = document.getElementById('out-message').value.trim();
        const channel = document.querySelector('.channel-select .active-channel').dataset.channel;

        if (!name || !email || !message) {
            alert('Please fill all fields.');
            return;
        }

        fetch(`${API_BASE}/api/contact-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, channel })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`✅ Your message has been sent via ${channel}. We'll get back to you soon!`);
                this.reset();
            } else {
                alert('❌ Failed to send. Please try again.');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Network error. Please check your connection.');
        });
    });
}

// ============================================
// AUTH MODAL
// ============================================

function initAuthModal() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuthModal');
    const switchLink = document.getElementById('authSwitchLink');
    const form = document.getElementById('authForm');
    const errorDiv = document.getElementById('authError');

    // Open modal from chat links
    const loginLink = document.getElementById('chat-login-link');
    const registerLink = document.getElementById('chat-register-link');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            openAuthModal('login');
        });
    }
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            openAuthModal('register');
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('active');
        });
    }

    // Switch between login/register
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (authMode === 'login') {
                openAuthModal('register');
            } else {
                openAuthModal('login');
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('authUsername').value.trim();
            const password = document.getElementById('authPassword').value.trim();
            const confirmPassword = document.getElementById('authConfirmPassword').value.trim();

            if (errorDiv) {
                errorDiv.style.display = 'none';
                errorDiv.textContent = '';
            }

            if (authMode === 'register') {
                if (password !== confirmPassword) {
                    if (errorDiv) {
                        errorDiv.textContent = 'Passwords do not match.';
                        errorDiv.style.display = 'block';
                    }
                    return;
                }
                if (password.length < 6) {
                    if (errorDiv) {
                        errorDiv.textContent = 'Password must be at least 6 characters.';
                        errorDiv.style.display = 'block';
                    }
                    return;
                }
            }

            const endpoint = authMode === 'login' ? '/api/visitor-login' : '/api/visitor-register';

            try {
                const res = await fetch(`${API_BASE}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (data.success) {
                    visitorToken = data.token;
                    localStorage.setItem('visitorToken', visitorToken);
                    alert(`✅ ${authMode === 'login' ? 'Logged in' : 'Registered'} successfully!`);
                    if (modal) modal.classList.remove('active');
                    loadConversation();
                    const statusSpan = document.getElementById('chat-auth-status');
                    if (statusSpan) {
                        statusSpan.innerHTML = `Logged in as <strong>${username}</strong> | <a href="#" id="chat-logout-link">Logout</a>`;
                        const logoutLink = document.getElementById('chat-logout-link');
                        if (logoutLink) {
                            logoutLink.addEventListener('click', function(e) {
                                e.preventDefault();
                                localStorage.removeItem('visitorToken');
                                visitorToken = null;
                                location.reload();
                            });
                        }
                    }
                } else {
                    if (errorDiv) {
                        errorDiv.textContent = data.error || 'Authentication failed.';
                        errorDiv.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('Auth error:', err);
                if (errorDiv) {
                    errorDiv.textContent = 'Network error. Please check your internet connection and try again.';
                    errorDiv.style.display = 'block';
                }
            }
        });
    }
}

function openAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authModalTitle');
    const sub = document.getElementById('authModalSub');
    const submitBtn = document.getElementById('authSubmitBtn');
    const switchLink = document.getElementById('authSwitchLink');
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    const errorDiv = document.getElementById('authError');

    authMode = mode;
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    if (mode === 'login') {
        if (title) title.textContent = 'Login';
        if (sub) sub.textContent = 'Enter your credentials';
        if (submitBtn) submitBtn.textContent = 'Login';
        if (switchLink) switchLink.textContent = 'Register';
        const switchText = document.getElementById('authSwitchText');
        if (switchText) switchText.innerHTML = `Don't have an account? <a id="authSwitchLink">Register</a>`;
        if (confirmGroup) confirmGroup.style.display = 'none';
        const confirmInput = document.getElementById('authConfirmPassword');
        if (confirmInput) confirmInput.removeAttribute('required');
    } else {
        if (title) title.textContent = 'Register';
        if (sub) sub.textContent = 'Create an account to chat';
        if (submitBtn) submitBtn.textContent = 'Register';
        if (switchLink) switchLink.textContent = 'Login';
        const switchText = document.getElementById('authSwitchText');
        if (switchText) switchText.innerHTML = `Already have an account? <a id="authSwitchLink">Login</a>`;
        if (confirmGroup) confirmGroup.style.display = 'block';
        const confirmInput = document.getElementById('authConfirmPassword');
        if (confirmInput) confirmInput.setAttribute('required', true);
    }

    // Reset form
    const form = document.getElementById('authForm');
    if (form) form.reset();
    // Reset password visibility toggles
    document.querySelectorAll('.toggle-password i').forEach(icon => {
        icon.className = 'fas fa-eye';
    });
    document.querySelectorAll('.input-wrapper input[type="password"]').forEach(input => {
        input.type = 'password';
    });

    if (modal) modal.classList.add('active');
    const usernameInput = document.getElementById('authUsername');
    if (usernameInput) usernameInput.focus();

    // Re-bind switch link
    const newSwitchLink = document.getElementById('authSwitchLink');
    if (newSwitchLink) {
        newSwitchLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (authMode === 'login') {
                openAuthModal('register');
            } else {
                openAuthModal('login');
            }
        });
    }
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ============================================
// CHAT (IN CONVERSATION)
// ============================================

function initChat() {
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendChatMessage);
    }
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    if (visitorToken) {
        loadConversation();
    }
}

function loadConversation() {
    const messagesDiv = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!messagesDiv) return;

    fetch(`${API_BASE}/api/chat`, {
        headers: { 'Authorization': `Bearer ${visitorToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentConversationId = data.conversationId;
            renderChatMessages(data.messages);
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            const statusSpan = document.getElementById('chat-auth-status');
            if (statusSpan) {
                statusSpan.innerHTML = `Logged in as <strong>${data.username}</strong> | <a href="#" id="chat-logout-link">Logout</a>`;
                const logoutLink = document.getElementById('chat-logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        localStorage.removeItem('visitorToken');
                        visitorToken = null;
                        location.reload();
                    });
                }
            }
            if (chatPollInterval) clearInterval(chatPollInterval);
            chatPollInterval = setInterval(fetchNewMessages, 3000);
        } else {
            messagesDiv.innerHTML = `<p style="color:var(--text-light);text-align:center;width:100%;padding:1rem;">${data.error || 'Unable to load chat.'}</p>`;
        }
    })
    .catch(err => {
        console.error(err);
        messagesDiv.innerHTML = `<p style="color:var(--text-light);text-align:center;width:100%;padding:1rem;">Network error loading chat.</p>`;
    });
}

function renderChatMessages(messages) {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;
    if (!messages || messages.length === 0) {
        messagesDiv.innerHTML = `<p style="color:var(--text-light);text-align:center;width:100%;padding:1rem;">No messages yet. Say hello!</p>`;
        return;
    }
    messagesDiv.innerHTML = messages.map(msg => `
        <div class="chat-message ${msg.sender_type === 'visitor' ? 'visitor' : 'admin'}">
            ${msg.sender_type === 'admin' ? '👤 Admin: ' : ''}${msg.message}
            <div style="font-size:0.7rem;opacity:0.6;margin-top:0.2rem;">${new Date(msg.sent_at).toLocaleTimeString()}</div>
        </div>
    `).join('');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function fetchNewMessages() {
    if (!currentConversationId) return;
    fetch(`${API_BASE}/api/chat/messages?since=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${visitorToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.messages && data.messages.length > 0) {
            const messagesDiv = document.getElementById('chat-messages');
            if (!messagesDiv) return;
            data.messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = `chat-message ${msg.sender_type === 'visitor' ? 'visitor' : 'admin'}`;
                div.innerHTML = `${msg.sender_type === 'admin' ? '👤 Admin: ' : ''}${msg.message} <div style="font-size:0.7rem;opacity:0.6;margin-top:0.2rem;">${new Date(msg.sent_at).toLocaleTimeString()}</div>`;
                messagesDiv.appendChild(div);
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    })
    .catch(err => console.error('Polling error:', err));
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;
    if (!visitorToken) {
        alert('Please login first.');
        return;
    }
    input.disabled = true;
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
        input.disabled = false;
        if (data.success) {
            input.value = '';
            const messagesDiv = document.getElementById('chat-messages');
            if (messagesDiv) {
                const div = document.createElement('div');
                div.className = 'chat-message visitor';
                div.innerHTML = `${message} <div style="font-size:0.7rem;opacity:0.6;margin-top:0.2rem;">Just now</div>`;
                messagesDiv.appendChild(div);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        } else {
            alert('Failed to send: ' + data.error);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network error while sending.');
        input.disabled = false;
    });
}

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
        if (navLinks) navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
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
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', loadPublicData);
console.log('✅ main.js loaded and ready!');