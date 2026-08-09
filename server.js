const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CLOUDINARY CONFIG
// ============================================
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
console.log('✅ Cloudinary configured');

// ============================================
// DATABASE CONNECTION
// ============================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.error('❌ DB connection failed:', err.stack);
    else console.log('✅ Connected to PostgreSQL');
});

// ============================================
// CORS CONFIGURATION - FIXED
// ============================================

const allowedOrigins = [
    'https://ochiengsportfolio.netlify.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'https://portfolio-cms-gqrm.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// MULTER
// ============================================
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ============================================
// HELPER: query with error logging
// ============================================
const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error('❌ SQL Error:', err.message);
        console.error('   Query:', text);
        console.error('   Params:', params);
        throw err;
    }
};

// ============================================
// ROOT & HEALTH
// ============================================
app.get('/', (req, res) => res.json({ message: 'Portfolio API running' }));
app.get('/api/test', (req, res) => res.json({ status: 'OK' }));
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================
// UPLOAD ENDPOINTS
// ============================================
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });
        const b64 = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'portfolio-projects', resource_type: 'auto' });
        res.json({ success: true, url: result.secure_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files' });
        const urls = await Promise.all(req.files.map(async file => {
            const b64 = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataUri, { folder: 'portfolio-projects', resource_type: 'auto' });
            return result.secure_url;
        }));
        res.json({ success: true, urls, count: urls.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// GET ALL DATA
// ============================================
app.get('/api/data', async (req, res) => {
    try {
        // 1. Profile
        const profileRes = await query('SELECT * FROM profile LIMIT 1');
        const profile = profileRes.rows[0] || {};

        // 2. About paragraphs
        const aboutRes = await query('SELECT content FROM about_paragraphs ORDER BY display_order');
        const paragraphs = aboutRes.rows.map(r => r.content);

        // 3. Skills with items
        const skillsRes = await query('SELECT * FROM skills ORDER BY display_order');
        const skills = [];
        for (const skill of skillsRes.rows) {
            const itemsRes = await query('SELECT name FROM skill_items WHERE skill_id = $1 ORDER BY display_order', [skill.id]);
            skills.push({
                id: skill.id,
                category: skill.category,
                icon: skill.icon,
                items: itemsRes.rows.map(r => r.name)
            });
        }

        // 4. Groups and projects
        const groupsRes = await query('SELECT * FROM project_groups ORDER BY display_order');
        const projectGroups = [];
        for (const group of groupsRes.rows) {
            const projectsRes = await query('SELECT * FROM projects WHERE group_id = $1 ORDER BY display_order', [group.id]);
            const projects = [];
            for (const proj of projectsRes.rows) {
                // FIX: Use ORDER BY id for tables without display_order
                const imagesRes = await query('SELECT url FROM project_images WHERE project_id = $1 ORDER BY id', [proj.id]);
                const videosRes = await query('SELECT url FROM project_videos WHERE project_id = $1 ORDER BY id', [proj.id]);
                const techRes = await query('SELECT name FROM project_technologies WHERE project_id = $1 ORDER BY id', [proj.id]);
                const filesRes = await query('SELECT name, data, size, type FROM project_files WHERE project_id = $1 ORDER BY id', [proj.id]);
                projects.push({
                    id: proj.id,
                    title: proj.title,
                    description: proj.description,
                    github: proj.github,
                    demo: proj.demo,
                    readme: proj.readme,
                    images: imagesRes.rows.map(r => r.url),
                    videos: videosRes.rows.map(r => r.url),
                    technologies: techRes.rows.map(r => r.name),
                    files: filesRes.rows
                });
            }
            projectGroups.push({
                id: group.id,
                name: group.name,
                icon: group.icon,
                description: group.description,
                projects
            });
        }

        // 5. Experience
        const expRes = await query('SELECT * FROM experience ORDER BY display_order');
        // 6. Education
        const eduRes = await query('SELECT * FROM education ORDER BY display_order');
        // 7. Certifications
        const certRes = await query('SELECT * FROM certifications ORDER BY display_order');
        // 8. Social links
        const socialRes = await query('SELECT platform, url FROM social_links ORDER BY display_order');
        const social = {};
        socialRes.rows.forEach(r => { social[r.platform] = r.url; });
        // 9. Welcome video
        const vidRes = await query('SELECT url FROM welcome_video LIMIT 1');
        const welcomeVideo = vidRes.rows[0] ? vidRes.rows[0].url : '';

        const result = {
            personal: {
                name: profile.name || '',
                title: profile.title || '',
                badge: profile.badge || '',
                heroSubtitle: profile.hero_subtitle || '',
                welcomeMessage: profile.welcome_message || '',
                email: profile.email || '',
                profileImage: profile.profile_image || '',
                aboutImage: profile.about_image || '',
                resume: profile.resume || ''
            },
            about: { paragraphs },
            skills,
            projectGroups,
            experience: expRes.rows,
            education: eduRes.rows,
            certifications: certRes.rows,
            social,
            videos: { welcome: welcomeVideo },
            footer: profile.footer || ''
        };

        res.json(result);
    } catch (err) {
        console.error('❌ /api/data error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// PROFILE UPDATE
// ============================================
app.put('/api/profile', async (req, res) => {
    try {
        const { name, title, badge, heroSubtitle, welcomeMessage, email, profileImage, aboutImage, resume, footer } = req.body;
        const check = await query('SELECT id FROM profile LIMIT 1');
        if (check.rowCount === 0) {
            await query(`INSERT INTO profile (name, title, badge, hero_subtitle, welcome_message, email, profile_image, about_image, resume, footer)
                         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
                [name, title, badge, heroSubtitle, welcomeMessage, email, profileImage, aboutImage, resume, footer]);
        } else {
            await query(`UPDATE profile SET name=$1, title=$2, badge=$3, hero_subtitle=$4, welcome_message=$5, email=$6,
                         profile_image=$7, about_image=$8, resume=$9, footer=$10, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
                [name, title, badge, heroSubtitle, welcomeMessage, email, profileImage, aboutImage, resume, footer]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('❌ /api/profile error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// ABOUT UPDATE
// ============================================
app.put('/api/about', async (req, res) => {
    try {
        const { paragraphs } = req.body;
        await query('DELETE FROM about_paragraphs');
        for (let i = 0; i < (paragraphs || []).length; i++) {
            await query('INSERT INTO about_paragraphs (content, display_order) VALUES ($1, $2)', [paragraphs[i], i + 1]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('❌ /api/about error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// SKILLS UPDATE
// ============================================
app.put('/api/skills', async (req, res) => {
    try {
        const { skills } = req.body;
        await query('DELETE FROM skill_items');
        await query('DELETE FROM skills');
        for (let i = 0; i < (skills || []).length; i++) {
            const skill = skills[i];
            const result = await query('INSERT INTO skills (category, icon, display_order) VALUES ($1,$2,$3) RETURNING id',
                [skill.category, skill.icon || 'fas fa-code', i + 1]);
            const skillId = result.rows[0].id;
            if (skill.items && skill.items.length) {
                for (let j = 0; j < skill.items.length; j++) {
                    await query('INSERT INTO skill_items (skill_id, name, display_order) VALUES ($1,$2,$3)',
                        [skillId, skill.items[j], j + 1]);
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error('❌ /api/skills error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// GROUP CRUD
// ============================================
app.post('/api/groups', async (req, res) => {
    try {
        const { name, icon, description } = req.body;
        const result = await query('INSERT INTO project_groups (name, icon, description) VALUES ($1,$2,$3) RETURNING id',
            [name, icon || 'fas fa-folder', description]);
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, description } = req.body;
        await query('UPDATE project_groups SET name=$1, icon=$2, description=$3 WHERE id=$4',
            [name, icon, description, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/groups/:id', async (req, res) => {
    try {
        await query('DELETE FROM project_groups WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// PROJECT CRUD
// ============================================
app.post('/api/groups/:groupId/projects', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, description, github, demo, readme, images, videos, technologies, files } = req.body;
        const result = await query(
            'INSERT INTO projects (group_id, title, description, github, demo, readme) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
            [groupId, title, description, github, demo, readme]
        );
        const projectId = result.rows[0].id;
        if (images) for (const url of images) await query('INSERT INTO project_images (project_id, url) VALUES ($1,$2)', [projectId, url]);
        if (videos) for (const url of videos) await query('INSERT INTO project_videos (project_id, url) VALUES ($1,$2)', [projectId, url]);
        if (technologies) for (const tech of technologies) await query('INSERT INTO project_technologies (project_id, name) VALUES ($1,$2)', [projectId, tech]);
        if (files) for (const file of files) await query('INSERT INTO project_files (project_id, name, data, size, type) VALUES ($1,$2,$3,$4,$5)',
            [projectId, file.name, file.data, file.size, file.type]);
        res.json({ success: true, id: projectId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, github, demo, readme, images, videos, technologies, files } = req.body;
        await query('UPDATE projects SET title=$1, description=$2, github=$3, demo=$4, readme=$5 WHERE id=$6',
            [title, description, github, demo, readme, id]);
        await query('DELETE FROM project_images WHERE project_id=$1', [id]);
        if (images) for (const url of images) await query('INSERT INTO project_images (project_id, url) VALUES ($1,$2)', [id, url]);
        await query('DELETE FROM project_videos WHERE project_id=$1', [id]);
        if (videos) for (const url of videos) await query('INSERT INTO project_videos (project_id, url) VALUES ($1,$2)', [id, url]);
        await query('DELETE FROM project_technologies WHERE project_id=$1', [id]);
        if (technologies) for (const tech of technologies) await query('INSERT INTO project_technologies (project_id, name) VALUES ($1,$2)', [id, tech]);
        await query('DELETE FROM project_files WHERE project_id=$1', [id]);
        if (files) for (const file of files) await query('INSERT INTO project_files (project_id, name, data, size, type) VALUES ($1,$2,$3,$4,$5)',
            [id, file.name, file.data, file.size, file.type]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await query('DELETE FROM projects WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// EXPERIENCE CRUD
// ============================================
app.get('/api/experience', async (req, res) => {
    try { const r = await query('SELECT * FROM experience ORDER BY display_order'); res.json(r.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/experience', async (req, res) => {
    try {
        const { company, role, period, description } = req.body;
        const r = await query('INSERT INTO experience (company, role, period, description) VALUES ($1,$2,$3,$4) RETURNING id', [company, role, period, description]);
        res.json({ success: true, id: r.rows[0].id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/experience/:id', async (req, res) => {
    try {
        const { company, role, period, description } = req.body;
        await query('UPDATE experience SET company=$1, role=$2, period=$3, description=$4 WHERE id=$5', [company, role, period, description, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/experience/:id', async (req, res) => {
    try { await query('DELETE FROM experience WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// EDUCATION CRUD
// ============================================
app.get('/api/education', async (req, res) => {
    try { const r = await query('SELECT * FROM education ORDER BY display_order'); res.json(r.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/education', async (req, res) => {
    try {
        const { institution, degree, field, period, description } = req.body;
        const r = await query('INSERT INTO education (institution, degree, field, period, description) VALUES ($1,$2,$3,$4,$5) RETURNING id', [institution, degree, field, period, description]);
        res.json({ success: true, id: r.rows[0].id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/education/:id', async (req, res) => {
    try {
        const { institution, degree, field, period, description } = req.body;
        await query('UPDATE education SET institution=$1, degree=$2, field=$3, period=$4, description=$5 WHERE id=$6', [institution, degree, field, period, description, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/education/:id', async (req, res) => {
    try { await query('DELETE FROM education WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// CERTIFICATIONS CRUD
// ============================================
app.get('/api/certifications', async (req, res) => {
    try { const r = await query('SELECT * FROM certifications ORDER BY display_order'); res.json(r.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/certifications', async (req, res) => {
    try {
        const { name, issuer, date, description, link, file } = req.body;
        const r = await query('INSERT INTO certifications (name, issuer, date, description, link, file) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [name, issuer, date, description, link, file]);
        res.json({ success: true, id: r.rows[0].id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/certifications/:id', async (req, res) => {
    try {
        const { name, issuer, date, description, link, file } = req.body;
        await query('UPDATE certifications SET name=$1, issuer=$2, date=$3, description=$4, link=$5, file=$6 WHERE id=$7', [name, issuer, date, description, link, file, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/certifications/:id', async (req, res) => {
    try { await query('DELETE FROM certifications WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// SOCIAL LINKS CRUD
// ============================================
app.get('/api/social', async (req, res) => {
    try { const r = await query('SELECT * FROM social_links ORDER BY display_order'); res.json(r.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/social', async (req, res) => {
    try {
        const { platform, icon, url } = req.body;
        await query('INSERT INTO social_links (platform, icon, url) VALUES ($1,$2,$3) ON CONFLICT (platform) DO UPDATE SET url=$3, icon=$2', [platform, icon, url]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/social/:platform', async (req, res) => {
    try { await query('DELETE FROM social_links WHERE platform=$1', [req.params.platform]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// WELCOME VIDEO
// ============================================
app.put('/api/welcome-video', async (req, res) => {
    try {
        const { url } = req.body;
        const check = await query('SELECT id FROM welcome_video LIMIT 1');
        if (check.rowCount === 0) await query('INSERT INTO welcome_video (url) VALUES ($1)', [url]);
        else await query('UPDATE welcome_video SET url=$1 WHERE id=1', [url]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// MESSAGES
// ============================================
app.get('/api/messages', async (req, res) => {
    try { const r = await query('SELECT * FROM messages ORDER BY date DESC'); res.json(r.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const r = await query('INSERT INTO messages (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING id', [name, email, subject, message]);
        res.json({ success: true, id: r.rows[0].id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/messages/:id', async (req, res) => {
    try { await query('DELETE FROM messages WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// START
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});