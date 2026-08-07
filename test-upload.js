const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function testUpload() {
    try {
        // Test using a sample image URL
        const result = await cloudinary.uploader.upload(
           'https://picsum.photos/300/200',
            { folder: 'test' }
        );
        console.log('✅ Upload successful!');
        console.log('URL:', result.secure_url);
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }
}

testUpload();