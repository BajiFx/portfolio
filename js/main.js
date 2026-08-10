// ============================================
// MAIN.JS - Public View (Full Chat & Project Details)
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
let authMode = 'login';

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
        initChat(); // <-- This must run
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
// RENDER PUBLIC PORTFOLIO (with safe null checks)
// ============================================

function renderPublicPortfolio() {
    const data = portfolioData;

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

        const profileImg = document.getElementById('profile-img');
        if (profileImg) {
            if (data.personal.profileImage && data.personal.profileImage.startsWith('http')) {
                profileImg.src = data.personal.profileImage;
                profileImg.style.display = 'block';
            } else {
                profileImg.style.display = 'none';
            }
        }

        const aboutImg = document.getElementById('about-img');
        if (aboutImg) {
            if (data.personal.aboutImage && data.personal.aboutImage.startsWith('http')) {
                aboutImg.src = data.personal.aboutImage;
                aboutImg.style.display = 'block';
            } else {
                aboutImg.style.display = 'none';
            }
        }

        if (data.personal.resume) {
            document.querySelectorAll('#resume-link, #resume-btn').forEach(link => {
                if (link) {
                    link.href = data.personal.resume;
                    link.style.display = 'flex';
                }
            });
        }

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
// PROJECT GROUPS & DETAILS
// ============================================

function renderProjectGroups(data) { /* ... (keep your existing) */ }
function showGroup(groupId) { /* ... */ }
function showProjectDetail(groupId, projectId) { /* ... (keep the full one with images, videos, README) */ }
function showGroups() { /* ... */ }
function openLightbox(imageSrc) { /* ... */ }
function renderSocialLinks(data) { /* ... */ }

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

function openAuthModal(mode) { /* ... (keep your existing) */ }
function togglePasswordVisibility(inputId, btn) { /* ... */ }

// ============================================
// CHAT (IN CONVERSATION)
// ============================================

function initChat() {
    console.log('🔧 initChat called');
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
    } else {
        // Show login/register prompt
        const messagesDiv = document.getElementById('chat-messages');
        if (messagesDiv) {
            messagesDiv.innerHTML = `<p style="color:var(--text-light);text-align:center;width:100%;padding:1rem;">Please login or register to start chatting.</p>`;
        }
        if (input) input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
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
            if (input) { input.disabled = false; input.focus(); }
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
// THEME, MOBILE, SMOOTH SCROLL (unchanged)
// ============================================

// ... (keep your existing theme toggle, hamburger, smooth scroll code)

document.addEventListener('DOMContentLoaded', loadPublicData);
console.log('✅ main.js loaded and ready!');