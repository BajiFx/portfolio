const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

console.log('✅ Cloudinary configured successfully!');
console.log(`   Cloud Name: ${process.env.CLOUD_NAME}`);

// ============================================
// DATABASE CONNECTION (PostgreSQL)
// ============================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL database!');
        release();
    }
});

// ============================================
// CORS CONFIGURATION
// ============================================

app.use(cors({
    origin: '*', // In production, set your Netlify URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// MULTER CONFIGURATION
// ============================================

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// ============================================
// HELPER: Run SQL queries with error handling
// ============================================

const query = (text, params) => pool.query(text, params);

// ============================================
// API ENDPOINTS
// ============================================

// ---------- ROOT ----------
app.get('/', (req, res) => {
    res.json({
        message: 'Portfolio API is running!',
        endpoints: {
            test: '/api/test',
            upload: '/api/upload',
            uploadMultiple: '/api/upload-multiple',
            dbTest: '/api/db-test',
            data: '/api/data (GET all portfolio data)',
            // See full list in code
        }
    });
});

// ---------- HEALTH ----------
app.get('/api/test', (req, res) => {
    res.json({ status: '✅ Server is running!', cloudinary: '✅ Configured' });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const result = await query('SELECT NOW() as current_time');
        res.json({ success: true, message: 'Database connected!', server_time: result.rows[0].current_time });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// FILE UPLOAD ENDPOINTS (existing)
// ============================================

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const fileStr = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${fileStr}`;
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'portfolio-projects',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true
        });
        res.json({ success: true, url: result.secure_url, public_id: result.public_id });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const uploadPromises = req.files.map(async (file) => {
            const fileStr = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${fileStr}`;
            const result = await cloudinary.uploader.upload(dataUri, {
                folder: 'portfolio-projects',
                resource_type: 'auto',
                use_filename: true,
                unique_filename: true
            });
            return result.secure_url;
        });
        const urls = await Promise.all(uploadPromises);
        res.json({ success: true, urls, count: urls.length });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

// ============================================
// GET ALL PORTFOLIO DATA (for public site & admin)
// ============================================

app.get('/api/data', async (req, res) => {
    try {
        // Profile
        const profileResult = await query('SELECT * FROM profile LIMIT 1');
        const profile = profileResult.rows[0] || {};

        // About paragraphs
        const aboutResult = await query('SELECT content FROM about_paragraphs ORDER BY display_order');
        const aboutParagraphs = aboutResult.rows.map(r => r.content);

        // Skills with items
        const skillsResult = await query(`
            SELECT s.id, s.category, s.icon, 
                   COALESCE(json_agg(json_build_object('name', si.name, 'display_order', si.display_order) ORDER BY si.display_order) FILTER (WHERE si.id IS NOT NULL), '[]') AS items
            FROM skills s
            LEFT JOIN skill_items si ON s.id = si.skill_id
            GROUP BY s.id
            ORDER BY s.display_order
        `);
        const skills = skillsResult.rows.map(row => ({
            id: row.id,
            category: row.category,
            icon: row.icon,
            items: row.items.map(item => item.name)
        }));

        // Project groups with nested projects, images, videos, tech, files
        const groupsResult = await query(`
            SELECT g.*, 
                   COALESCE(json_agg(
                       json_build_object(
                           'id', p.id,
                           'title', p.title,
                           'description', p.description,
                           'github', p.github,
                           'demo', p.demo,
                           'readme', p.readme,
                           'display_order', p.display_order,
                           'images', (SELECT COALESCE(json_agg(url ORDER BY display_order), '[]') FROM project_images WHERE project_id = p.id),
                           'videos', (SELECT COALESCE(json_agg(url ORDER BY display_order), '[]') FROM project_videos WHERE project_id = p.id),
                           'technologies', (SELECT COALESCE(json_agg(name ORDER BY display_order), '[]') FROM project_technologies WHERE project_id = p.id),
                           'files', (SELECT COALESCE(json_agg(json_build_object('name', name, 'data', data, 'size', size, 'type', type) ORDER BY display_order), '[]') FROM project_files WHERE project_id = p.id)
                       )
                       ORDER BY p.display_order
                   ) FILTER (WHERE p.id IS NOT NULL), '[]') AS projects
            FROM project_groups g
            LEFT JOIN projects p ON g.id = p.group_id
            GROUP BY g.id
            ORDER BY g.display_order
        `);
        const projectGroups = groupsResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.icon,
            description: row.description,
            projects: row.projects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                github: p.github,
                demo: p.demo,
                readme: p.readme,
                images: p.images || [],
                videos: p.videos || [],
                technologies: p.technologies || [],
                files: p.files || []
            }))
        }));

        // Experience
        const expResult = await query('SELECT * FROM experience ORDER BY display_order');
        const experience = expResult.rows;

        // Education
        const eduResult = await query('SELECT * FROM education ORDER BY display_order');
        const education = eduResult.rows;

        // Certifications
        const certResult = await query('SELECT * FROM certifications ORDER BY display_order');
        const certifications = certResult.rows;

        // Social links
        const socialResult = await query('SELECT platform, url FROM social_links ORDER BY display_order');
        const social = {};
        socialResult.rows.forEach(row => { social[row.platform] = row.url; });

        // Welcome video
        const videoResult = await query('SELECT url FROM welcome_video LIMIT 1');
        const welcomeVideo = videoResult.rows[0] ? videoResult.rows[0].url : '';

        // Build full portfolio object
        const portfolioData = {
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
            about: { paragraphs: aboutParagraphs },
            skills,
            projectGroups,
            experience,
            education,
            certifications,
            social,
            videos: { welcome: welcomeVideo },
            footer: profile.footer || ''
        };

        res.json(portfolioData);
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROFILE CRUD
// ============================================

app.put('/api/profile', async (req, res) => {
    try {
        const {
            name, title, badge, heroSubtitle, welcomeMessage, email,
            profileImage, aboutImage, resume, footer
        } = req.body;

        const result = await query(`
            UPDATE profile SET
                name = $1, title = $2, badge = $3, hero_subtitle = $4,
                welcome_message = $5, email = $6, profile_image = $7,
                about_image = $8, resume = $9, footer = $10,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            RETURNING *
        `, [name, title, badge, heroSubtitle, welcomeMessage, email, profileImage, aboutImage, resume, footer]);

        if (result.rowCount === 0) {
            // Insert if no profile exists
            await query(`
                INSERT INTO profile (name, title, badge, hero_subtitle, welcome_message, email, profile_image, about_image, resume, footer)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [name, title, badge, heroSubtitle, welcomeMessage, email, profileImage, aboutImage, resume, footer]);
        }

        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ABOUT PARAGRAPHS CRUD
// ============================================

app.put('/api/about', async (req, res) => {
    try {
        const { paragraphs } = req.body; // array of strings
        await query('DELETE FROM about_paragraphs');
        if (paragraphs && paragraphs.length > 0) {
            const values = paragraphs.map((p, i) => `($1, $${i+2})`).join(',');
            const params = [paragraphs.length];
            paragraphs.forEach((p, i) => params.push(p, i+1));
            await query(
                `INSERT INTO about_paragraphs (content, display_order) VALUES ${values}`,
                params
            );
        }
        res.json({ success: true, message: 'About updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SKILLS CRUD (full replace)
// ============================================

app.put('/api/skills', async (req, res) => {
    try {
        const { skills } = req.body; // array of { category, icon, items: [string] }
        await query('DELETE FROM skill_items');
        await query('DELETE FROM skills');
        for (const skill of skills) {
            const skillResult = await query(
                'INSERT INTO skills (category, icon, display_order) VALUES ($1, $2, $3) RETURNING id',
                [skill.category, skill.icon || 'fas fa-code', 0]
            );
            const skillId = skillResult.rows[0].id;
            if (skill.items && skill.items.length > 0) {
                for (const item of skill.items) {
                    await query(
                        'INSERT INTO skill_items (skill_id, name) VALUES ($1, $2)',
                        [skillId, item]
                    );
                }
            }
        }
        res.json({ success: true, message: 'Skills updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROJECT GROUPS CRUD
// ============================================

app.post('/api/groups', async (req, res) => {
    try {
        const { name, icon, description } = req.body;
        const result = await query(
            'INSERT INTO project_groups (name, icon, description) VALUES ($1, $2, $3) RETURNING id',
            [name, icon || 'fas fa-folder', description]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, description } = req.body;
        await query(
            'UPDATE project_groups SET name = $1, icon = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
            [name, icon, description, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM project_groups WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROJECTS CRUD (within a group)
// ============================================

app.post('/api/groups/:groupId/projects', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, description, github, demo, readme, images, videos, technologies, files } = req.body;
        // Insert project
        const projectResult = await query(
            `INSERT INTO projects (group_id, title, description, github, demo, readme)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [groupId, title, description, github, demo, readme]
        );
        const projectId = projectResult.rows[0].id;

        // Insert images
        if (images && images.length > 0) {
            for (const url of images) {
                await query('INSERT INTO project_images (project_id, url) VALUES ($1, $2)', [projectId, url]);
            }
        }
        // Insert videos
        if (videos && videos.length > 0) {
            for (const url of videos) {
                await query('INSERT INTO project_videos (project_id, url) VALUES ($1, $2)', [projectId, url]);
            }
        }
        // Insert technologies
        if (technologies && technologies.length > 0) {
            for (const tech of technologies) {
                await query('INSERT INTO project_technologies (project_id, name) VALUES ($1, $2)', [projectId, tech]);
            }
        }
        // Insert files (base64)
        if (files && files.length > 0) {
            for (const file of files) {
                await query(
                    'INSERT INTO project_files (project_id, name, data, size, type) VALUES ($1, $2, $3, $4, $5)',
                    [projectId, file.name, file.data, file.size, file.type]
                );
            }
        }

        res.json({ success: true, id: projectId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, github, demo, readme, images, videos, technologies, files } = req.body;

        // Update project details
        await query(
            `UPDATE projects SET title = $1, description = $2, github = $3, demo = $4, readme = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`,
            [title, description, github, demo, readme, id]
        );

        // Replace nested data (delete old, insert new)
        await query('DELETE FROM project_images WHERE project_id = $1', [id]);
        if (images && images.length > 0) {
            for (const url of images) {
                await query('INSERT INTO project_images (project_id, url) VALUES ($1, $2)', [id, url]);
            }
        }
        await query('DELETE FROM project_videos WHERE project_id = $1', [id]);
        if (videos && videos.length > 0) {
            for (const url of videos) {
                await query('INSERT INTO project_videos (project_id, url) VALUES ($1, $2)', [id, url]);
            }
        }
        await query('DELETE FROM project_technologies WHERE project_id = $1', [id]);
        if (technologies && technologies.length > 0) {
            for (const tech of technologies) {
                await query('INSERT INTO project_technologies (project_id, name) VALUES ($1, $2)', [id, tech]);
            }
        }
        await query('DELETE FROM project_files WHERE project_id = $1', [id]);
        if (files && files.length > 0) {
            for (const file of files) {
                await query(
                    'INSERT INTO project_files (project_id, name, data, size, type) VALUES ($1, $2, $3, $4, $5)',
                    [id, file.name, file.data, file.size, file.type]
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM projects WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EXPERIENCE CRUD
// ============================================

app.get('/api/experience', async (req, res) => {
    try {
        const result = await query('SELECT * FROM experience ORDER BY display_order');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/experience', async (req, res) => {
    try {
        const { company, role, period, description } = req.body;
        const result = await query(
            'INSERT INTO experience (company, role, period, description) VALUES ($1, $2, $3, $4) RETURNING id',
            [company, role, period, description]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/experience/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { company, role, period, description } = req.body;
        await query(
            'UPDATE experience SET company = $1, role = $2, period = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
            [company, role, period, description, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/experience/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM experience WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EDUCATION CRUD
// ============================================

app.get('/api/education', async (req, res) => {
    try {
        const result = await query('SELECT * FROM education ORDER BY display_order');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/education', async (req, res) => {
    try {
        const { institution, degree, field, period, description } = req.body;
        const result = await query(
            'INSERT INTO education (institution, degree, field, period, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [institution, degree, field, period, description]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/education/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { institution, degree, field, period, description } = req.body;
        await query(
            'UPDATE education SET institution = $1, degree = $2, field = $3, period = $4, description = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
            [institution, degree, field, period, description, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/education/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM education WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CERTIFICATIONS CRUD
// ============================================

app.get('/api/certifications', async (req, res) => {
    try {
        const result = await query('SELECT * FROM certifications ORDER BY display_order');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/certifications', async (req, res) => {
    try {
        const { name, issuer, date, description, link, file } = req.body;
        const result = await query(
            'INSERT INTO certifications (name, issuer, date, description, link, file) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, issuer, date, description, link, file]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/certifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, issuer, date, description, link, file } = req.body;
        await query(
            'UPDATE certifications SET name = $1, issuer = $2, date = $3, description = $4, link = $5, file = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7',
            [name, issuer, date, description, link, file, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/certifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM certifications WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SOCIAL LINKS CRUD
// ============================================

app.get('/api/social', async (req, res) => {
    try {
        const result = await query('SELECT * FROM social_links ORDER BY display_order');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/social', async (req, res) => {
    try {
        const { platform, icon, url } = req.body;
        const result = await query(
            'INSERT INTO social_links (platform, icon, url) VALUES ($1, $2, $3) ON CONFLICT (platform) DO UPDATE SET url = $3, icon = $2 RETURNING id',
            [platform, icon, url]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/social/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        await query('DELETE FROM social_links WHERE platform = $1', [platform]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WELCOME VIDEO CRUD
// ============================================

app.put('/api/welcome-video', async (req, res) => {
    try {
        const { url } = req.body;
        const result = await query('SELECT id FROM welcome_video LIMIT 1');
        if (result.rowCount === 0) {
            await query('INSERT INTO welcome_video (url) VALUES ($1)', [url]);
        } else {
            await query('UPDATE welcome_video SET url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [url, result.rows[0].id]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// MESSAGES CRUD
// ============================================

app.get('/api/messages', async (req, res) => {
    try {
        const result = await query('SELECT * FROM messages ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const result = await query(
            'INSERT INTO messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, subject, message]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM messages WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Test: http://0.0.0.0:${PORT}/api/test`);
    console.log(`   DB Test: http://0.0.0.0:${PORT}/api/db-test`);
    console.log(`   All Data: http://0.0.0.0:${PORT}/api/data`);
    console.log('\n📌 All CRUD endpoints ready!\n');
});