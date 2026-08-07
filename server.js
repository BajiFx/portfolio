const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
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
// CORS CONFIGURATION - FIXED FOR EXPRESS v5
// ============================================

// Allow all origins – this also handles preflight (OPTIONS) requests automatically
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

// Removed app.options('*', cors()) because it's not needed and causes an error in Express v5

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MULTER CONFIGURATION
// ============================================

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    }
});

// ============================================
// API ENDPOINTS
// ============================================

// Root route – shows API info
app.get('/', (req, res) => {
    res.json({
        message: 'Portfolio API is running!',
        endpoints: {
            test: '/api/test',
            upload: '/api/upload',
            uploadMultiple: '/api/upload-multiple'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        status: '✅ Server is running!',
        cloudinary: '✅ Configured',
        message: 'Portfolio API is ready'
    });
});

// Single file upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`📤 Uploading: ${req.file.originalname} (${req.file.size} bytes)`);

        const fileStr = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${fileStr}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'portfolio-projects',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true
        });

        console.log(`✅ Upload successful: ${result.secure_url}`);

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
});

// Multiple files upload
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        console.log(`📤 Uploading ${req.files.length} files...`);

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

        console.log(`✅ ${urls.length} files uploaded successfully`);

        res.json({
            success: true,
            urls: urls,
            count: urls.length
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Test: http://0.0.0.0:${PORT}/api/test`);
    console.log(`   Upload: http://0.0.0.0:${PORT}/api/upload`);
    console.log(`   Multiple Upload: http://0.0.0.0:${PORT}/api/upload-multiple`);
    console.log('\n📌 Make sure your admin panel points to this server!\n');
});